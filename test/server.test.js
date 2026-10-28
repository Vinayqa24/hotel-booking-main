const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { after, before, test } = require("node:test");
const { createApp, createDatabase } = require("../server");
const { DatabaseSync } = require("node:sqlite");

const db = createDatabase(":memory:");
let server;
let baseUrl;

before(async () => {
  const app = await createApp({ db });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  db.close();
});

async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return { response, data: await response.json() };
}

test("health endpoint reports readiness", async () => {
  const { response, data } = await request("/api/health");
  assert.equal(response.status, 200);
  assert.deepEqual(data, { status: "ok" });
});

test("a guest can book without signing in and receive a success response", async () => {
  const { response, data } = await request("/api/bookings", {
    method: "POST",
    body: {
      guestName: "Riya Shah",
      roomType: "Couple Room",
      checkIn: "2030-01-05",
      checkOut: "2030-01-08",
      guests: 2,
      phone: "+1 555 123 4567",
    },
  });

  assert.equal(response.status, 201);
  assert.equal(data.booking.guestName, "Riya Shah");
  assert.equal(data.booking.roomType, "Couple Room");
  assert.equal(data.booking.checkIn, "2030-01-05");
  assert.equal(data.booking.checkOut, "2030-01-08");
  assert.equal(data.booking.guests, 2);
});

test("booking rejects invalid dates and missing guest details", async () => {
  const invalidDate = await request("/api/bookings", {
    method: "POST",
    body: {
      guestName: "Riya Shah",
      roomType: "Single Room",
      checkIn: "2030-02-30",
      checkOut: "2030-03-05",
      guests: 1,
      phone: "5551234567",
    },
  });
  assert.equal(invalidDate.response.status, 400);

  const missingDetails = await request("/api/bookings", {
    method: "POST",
    body: {},
  });
  assert.equal(missingDetails.response.status, 400);
});

test("existing account-based bookings migrate to the no-account schema", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "hotel-booking-test-"));
  const databasePath = path.join(directory, "hotel.sqlite");
  const legacyDb = new DatabaseSync(databasePath);
  legacyDb.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE bookings (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      room_type TEXT NOT NULL,
      facility TEXT NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      room_count INTEGER NOT NULL,
      adults INTEGER NOT NULL,
      children INTEGER NOT NULL,
      phone TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    INSERT INTO users VALUES (1, 'Riya', 'Shah', 'riya', 'riya@example.com', 'unused', '2030-01-01');
    INSERT INTO bookings VALUES (
      1, 1, 'Couple Room', '3-Star', '2030-01-05', '2030-01-08',
      1, 2, 1, '5551234567', '2030-01-01'
    );
  `);
  legacyDb.close();

  try {
    const migratedDb = createDatabase(databasePath);
    const booking = migratedDb.prepare("SELECT * FROM bookings").get();
    assert.equal(booking.guest_name, "Riya Shah");
    assert.equal(booking.guests, 3);
    assert.equal(booking.room_type, "Couple Room");
    migratedDb.close();
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
