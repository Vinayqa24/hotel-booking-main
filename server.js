const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const { DatabaseSync } = require("node:sqlite");

const ROOM_TYPES = new Set(["Single Room", "Couple Room", "Family Room"]);

function createDatabase(databasePath) {
  if (databasePath !== ":memory:") {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const db = new DatabaseSync(databasePath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY,
      guest_name TEXT NOT NULL,
      room_type TEXT NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 6),
      phone TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
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
          room_type TEXT NOT NULL,
          check_in TEXT NOT NULL,
          check_out TEXT NOT NULL,
          guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 6),
          phone TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        INSERT INTO bookings_new (
          id, guest_name, room_type, check_in, check_out, guests, phone, created_at
        )
        SELECT bookings.id,
          COALESCE(NULLIF(trim(users.first_name || ' ' || users.last_name), ''), 'Previous guest'),
          bookings.room_type,
          bookings.check_in,
          bookings.check_out,
          MIN(6, MAX(1, bookings.adults + bookings.children)),
          bookings.phone,
          bookings.created_at
        FROM bookings
        LEFT JOIN users ON users.id = bookings.user_id;
        DROP TABLE bookings;
        ALTER TABLE bookings_new RENAME TO bookings;
      `);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  return db;
}

function isCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseBooking(body) {
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
  app.use(express.json({ limit: "10kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.post("/api/bookings", (request, response) => {
    const input = parseBooking(request.body || {});
    if (!input) {
      response.status(400).json({ error: "Please enter your name, a valid room, dates, guests, and phone number." });
      return;
    }

    const result = db.prepare(`
      INSERT INTO bookings (guest_name, room_type, check_in, check_out, guests, phone)
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
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      response.status(400).json({ error: "The request body must be valid JSON." });
      return;
    }
    console.error(error);
    response.status(500).json({ error: "Something went wrong. Please try again." });
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
