const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const express = require("express");
const { DatabaseSync } = require("node:sqlite");

const ROOM_TYPES = new Set(["Single Room", "Couple Room", "Family Room"]);

function createDatabase(databasePath) {
  if (databasePath !== ":memory:") {
    fs.mkdirSync(path.resolve(path.dirname(databasePath)), { recursive: true });
  }

  const db = new DatabaseSync(databasePath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL DEFAULT '',
      room_type TEXT NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 6),
      phone TEXT NOT NULL,
      booking_reference TEXT,
      status TEXT NOT NULL DEFAULT 'Confirmed',
      idempotency_key TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_reference_nonnull ON bookings(booking_reference)
      WHERE booking_reference IS NOT NULL;
    CREATE UNIQU INDEX IF NOT EXISTS idx_bookings_idempotency_nonnull ON bookings(idempotency_key)
      WHERE idempotency_key IS NOT NULL;
  `);

  const bookingColumns = db.prepare("PRAGMA table_info(bookings)").all()
    .map((column) => column.name);
  if (!bookingColumns.includes("guest_name")) {
    const requiredLegacyColumns = [
      "user_id",
      "room_type",
      "check_in",
      "check_out",
      "adults",
      "children",
      "phone",
    ];
    if (!requiredLegacyColumns.every((column) => bookingColumns.includes(column))) {
      throw new Error("The existing bookings table has an unsupported schema.");
    }

    db.exec("BEGIN");
    try {
      db.exec(`
        CREATE TABLE bookings_new (
          id INTEGER PRIMARY KEY,
          guest_name TEXT NOT NULL,
          guest_email TEXT NOT NULL DEFAULT '',
          room_type TEXT NOT NULL,
          check_in TEXT NOT NULL,
          check_out TEXT NOT NULL,
          guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 6),
          phone TEXT NOT NULL,
          booking_reference TEXT,
          status TEXT NOT NULL DEFAULT 'Confirmed',
          idempotency_key TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        INSERT INTO bookings_new (
          id, guest_name, guest_email, room_type, check_in, check_out, guests, phone, created_at
        )
        SELECT bookings.id,
          COALESCE(NULLIF(            trim(users.first_name || ' ' || users.last_name), ''),
            'Previous guest'),
          COALESCE(users.email, ''),
          bookings.room_type,
          bookings.check_in,
          bookings.check_out,
          MIN(6, MAX(1, bookings.adults + bookings.children)),
          bookings.phone,
          bookings.created_at
        FROM booking        LEFT JOIN users ON users.id = bookings.user_id;
        DROP TABLE bookings;
        ALTER TABLE bookings_new RENAME TO bookings;
      `);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS booking_idempotency (
      idempotency_key TEXT PRIMARY KEY,
      booking_reference TEXT NOT NULL,
      payload_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}

function isCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidEmail(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length < 3 || trimmed.length > 254) return false;
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed);
}

function sha256Json(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function createCorrelationId() {
  return crypto.randomUUID();
}

function createBookingReference() {
  return `BK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function apiError(response, status, { errorCode, message, correlationId }) {
  response.status(status).json({ errorCode, message, correlationId });
}

function parseWizardBooking(body) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const hotelId = typeof body.hotelId === "string" ? body.hotelId.trim() : "";
  const hotelName = typeof body.hotelName === "string" ? body.hotelName.trim() : "";
  const roomType = typeof body.roomType === "string" ? body.roomType : "";
  const checkInDate = body.checkInDate;
  const checkOutDate = body.checkOutDate;
  const rooms = body.rooms;
  const adults = body.adults;
  const children = body.children ?? 0;
  const guest = body.guest;
  const pricing = body.pricing;

  const totalAmount = pricing && typeof pricing.totalAmount === "number" ? pricing.totalAmount : NaN;
  const currency = pricing && typeof pricing.currency === "string" ? pricing.currency.trim() : "";

  const guestFullName = guest && typeof guest.fullName === "string" ? guest.fullName.trim() : "";
  const guestEmail = guest && typeof guest.email === "string" ? guest.email.trim() : "";
  const guestPhone = guest && typeof guest.phone === "string" ? guest.phone.trim() : "";

  if (!hotelId || !hotelName) return null;
  if (!ROOM_TYPES.has(roomType)) return null;
  if (!isCalendarDate(checkInDate) || !isCalendarDate(checkOutDate)) return null;

  const today = new Date().toISOString().slice(0, 10);
  if (checkInDate < today) return null;
  if (checkOutDate <= checkInDate) return null;

  const maxStayNights = 30;
  const stayNights = (new Date(`${checkOutDate}T00:00:00Z`) - new Date(`${checkInDate}T00:00:00Z`)) / (1000 * 60 * 60 * 24);
  if (!Number.isFinite(stayNights) || stayNights <= 0 || stayNights > maxStayNights) return null;

  if (!Number.isInteger(rooms) || rooms < 1 || rooms > 5) return null;
  if (!Number.isInteger(adults) || adults < 1 || adults > 10) return null;
  if (!Number.isInteger(children) || children < 0 || children > 10) return null;

  if (!guestFullName || guestFullName.length > 80) return null;
  if (!isValidEmail(guestEmail)) return null;

  if (guestPhone && !/^[0-9+() -]{7,20}$/.test(guestPhone)) return null;

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) return null;
  if (!currency || currency.length > 8) return null;

  return {
    hotelId,
    hotelName,
    roomType,
    checkInDate,
    checkOutDate,
    rooms,
    adults,
    children,
    guest: { fullName: guestFullName, email: guestEmail, phone: guestPhone || null },
    pricing: { totalAmount, currency },
  };
}

function parseLegacyBooking(body) {
  if (
    typeof body.guestName !== "string" ||
    body.guestName.trim().length === 0 ||
    body.guestName.trim().length > 80 ||
    !ROOM_TYPES.has(body.roomType) ||
    !isCalendarDate(body.checkIn) ||
    !isCalendarDate(body.checkOut) ||
    body.checkIn < new Date().toISOString().slice(0, 10) ||
    body.checkOut <= body.checkIn ||
    !Number.isInteger(body.guests) ||
    body.guests < 1 ||
    body.guests > 6 ||
    typeof body.phone !== "string" ||
    !/^[0-9+() -]{7,20}$/.test(body.phone.trim())
  ) {
    return null;
  }

  return { ...body, guestName: body.guestName.trim(), phone: body.phone.trim() };
}

async function createApp({ db }) {
  const app = express();
  app.use(express.json( { limit: "10kb" }));

  app.use((request, response, next) => {
    request.correlationId = request.get("X-Correlation-Id") || createCorrelationId();
    response.set("X-Correlation-Id", request.correlationId);
    next();
  });

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.post("/api/bookings", (request, response) => {
    const correlationId = request.correlationId;

    const idempotencyKey = request.get("Idempotency-Key");
    if (idempotencyKey) {
      const payload = parseWizardBooking(request.body);
      if (!payload) {
        apiError(response, 400, {
          errorCode: "VALIDATION_ERROR",
          message: "Please provide valid booking details (dates, guests, guest name, and email).",
          correlationId,
        });
        return;
      }

      const payloadHash = sha256Json(payload);
      const existingMapping = db.prepare(
        "SELECT booking_reference AS bookingReference, payload_hash AS payloadHash FROM booking_idempotency WHERE idempotency_key = ?"
      ).get(idempotencyKey);

      if (existingMapping) {
        if (existingMapping.payloadHash !== payloadHash) {
          apiError(response, 409, {
            errorCode: "IDEMPOTENCY_KEY_REUSE",
            message: "This booking request has already been submitted. Please refresh and try again.",
            correlationId,
          });
          return;
        }

        const existingBooking = db.prepare(`
          SELECT booking_reference AS reference, status,
            check_in AS checkInDate, check_out AS checkOutDate,
            guests,
            created_at AS createdAt
          FROM bookings
          WHERE booking_reference = ?
        `)).get(existingMapping.bookingReference);

        if (!existingBooking) {
          apiError(response, 500, {
            errorCodfS¢$$ôô´”äuô5$TDUôd”ÄTB"À¢ÖW76vS¢%vR6÷VÆFâwB6öæf—&Ò–÷W"&öö¶–ær&–v‡Bæ÷râÆV6RG'’v–ââ"À¢6÷'&VÆF–öä–BÀ¢Ò“°¢&WGW&ã°¢Ð ¢&W7öç6Rç7FGW2ƒ#’æ§6öâ‚°¢&VfW&Væ6S¢W†—7F–æt&öö¶–ærç&VfW&Væ6RÀ¢7FGW3¢W†—7F–æt&öö¶–ærç7FGW2À¢&öö¶–æs¢°¢†÷FVÄæÖS¢–ÆöBæ†÷FVÄæÖRÀ¢6†V6´–äFFS¢–ÆöBæ6†V6´–äFFRÀ¢6†V6´÷WDFFS¢–ÆöBæ6†V6´÷WDFFRÀ¢&öö×3¢–ÆöBç&öö×2À¢GVÇG3¢–ÆöBæGVÇG2À¢6†–ÆG&Vã¢–ÆöBæ6†–ÆG&VâÀ¢F÷FÄÖ÷VçC¢–ÆöBç&–6–ærçF÷FÄÖ÷VçBÀ¢7W'&Væ7“¢–ÆöBç&–6–æræ7W'&Væ7’À¢ÒÀ¢Ò“°¢&WGW&ã°¢Ð ¢6öç7B&öö¶–æu&VfW&Væ6RÒ7&VFT&öö¶–æu&VfW&Væ6R‚“°¢G'’°¢F"æW†V2‚$$Tt”â"“°¢F"ç&W&R† ¢”å4U%B”åDò&öö¶–æw2€¢wVW7EöæÖRÂwVW7EöVÖ–ÂÂ&ööÕ÷G—RÂ6†V6µö–âÂ6†V6µö÷WBÂwVW7G2Â†öæRÀ¢&öö¶–æu÷&VfW&Væ6RÂ7FGW2Â–FV×÷FVæ7•ö¶W¢’dÅTU2ƒòÂòÂòÂòÂòÂòÂòÂòÂt6öæ—&ÖVBrÂò¢’ç'Vâ€¢–ÆöBæwVW7BægVÆÄæÖRÀ¢–ÆöBæwVW7BæVÖ–ÂÀ¢–ÆöBç&ööÕG—RÀ¢–ÆöBæ6†V6´–äFFRÀ¢–ÆöBæ6†V6´÷WDFFRÀ¢ÖF‚æÖ–âƒbÂ–ÆöBæGVÇG2²–ÆöBæ6†–ÆG&Vâ’À¢–ÆöBæwVW7Bç†öæRÀ¢&öö¶–æu&VfW&Væ6RÀ¢–FV×÷FVæ7”¶W’À¢“°¢F"ç&W&R€¢$”å4U%B”åDò&öö¶–æuö–FV×÷FVæ7’†–FV×÷FVæ7•ö¶W’Â&öö¶–æu÷&VfW&Væ6RÂ–ÆöEö†6‚’dÅTU2ƒòÂòÂò’ ¢’ç'Vâ†–FV×÷FVæ7”¶W’Â&öö¶–æu&VfW&Væ6RÂ–ÆöD†6‚“°¢F"æW†V2‚$4ôÔÔ•B"“°¢Ò6F6‚†W'&÷"’°¢F"æW†V2‚%$ôÄÄ$4²"“°¢”W'&÷"‡&W7öç6RÂSÂ°¢W'&÷$6öFS¢$$ôô´”äuô5$TDUôd”ÄTB"À¢ÖW76vS¢%vR6÷VÆFâwB6öæf—&Ò–÷W"&öö¶–ær&–v‡Bæ÷râÆV6RG'’v–ââ"À¢6÷'&VÆF–öä–BÀ¢Ò“°¢&WGW&ã°¢Ð ¢&W7öç6Rç7FGW2ƒ#’æ§6öâ‡°¢&VfW&Væ6S¢&öö¶–æu&VfW&Væ6RÀ¢7FGW3¢$6öæf—&ÖVB"À¢&öö¶–æs¢°¢†÷FVÄæÖS¢–ÆöBæ†÷FVÄæÖRÀ¢6†V6´–äFFS¢–ÆöBæ6†V6´–äFFRÀ¢6†V6´÷WDFFS¢–ÆöBæ6†V6´÷WDFFRÀ¢&öö×3¢–ÆöBç&öö×2À¢GVÇG3¢–ÆöBæGVÇG2À¢6†–ÆG&Vã¢–ÆöBæ6†–ÆG&VâÀ¢F÷FÄÖ÷VçC¢–ÆöBç&–6–ærçF÷FÄÖ÷VçBÀ¢7W'&Væ7“¢–ÆöBç&–6–æræ7W'&Væ7’À¢ÒÀ¢Ò“°¢&WGW&ã°¢Ð ¢6öç7B–çWBÒ'6TÆVv7”&öö¶–ær‡&WVW7Bæ&öG’ÇÂ·Ò“°¢–b‚–çWB’°¢&W7öç6Rç7FGW2ƒC’æ§6öâ‚²W'&÷#¢%ÆV6RVçFW"–÷W"æÖRÂfÆ–B&ööÒÂFFW2ÂwVW7G2ÂæB†öæRçVÖ&W"â"Ò“°¢&WGW&ã°¢Ð ¢6öç7B&W7VÇBÒF"ç&W&R† ¢”å4U%B”åDò&öö¶–æw2†wVW7EöæÖRÂ&ööÕ÷G—RÂ6†V6µö–âÂ6†V6´out, guests, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      input.guestName,
      input.roomType,
      input.checkIn,
      input.checkOut,
      input.guests,
      input.phone,
    );
    const booking = db.prepare(`
      SELECT id, guest_name AS guestName, room_type AS roomType,
        check_in AS checkIn, check_out AS checkOut, guests
      FROM bookings WHERE id = ?
    `).get(Number(result.lastInsertRowid));
    response.status(201).json({ booking });
  });

  app.use(express.static(path.join(__dirname, "public")));
  app.use((error, _request, response, _next) => {
    const correlationId = _request.correlationId || createCorrelationId();
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      apiError(response, 400, {
        errorCode: "INVALID_JSON",
        message: "The request body must be valid JSON.",
        correlationId,
      });
      return;
    }
    console.error(error);
    apiError(response, 500, {
      errorCode: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong. Please try again.",
      correlationId,
    });
  });

  return app;
}

if (require.main === module) {
  const databasePath = path.join(__dirname, "data", "hotel-booking.sqlite");
  const db = createDatabase(databasePath);
  createApp({ db }).then((app) => {
    const port = Number(process.env.PORT) || 3000;
    app.listen(port, "0.0.0.0", () => {
      console.log(`Hotel Titan is running at http://localhost:${port}`);
    });
  }).catch((error) => {
    console.error("Could not start the hotel booking app:", error);
    process.exitCode = 1;
  });
}

module.exports = { createApp, createDatabase };
