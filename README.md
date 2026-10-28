# Hotel Titan Booking

A simple browser-based hotel booking app converted from the original Java Swing screens. Guests can choose a room and dates, enter their name and phone number, and submit a booking without creating an account.

## Run locally

Requirements: Node.js 22.13 or newer.

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database is created automatically at `data/hotel-booking.sqlite`; it persists across restarts and is excluded from Git.

Use `npm start` for a normal local run and `npm test` to run the API tests.

## Booking flow

- Takes the guest name, room type, check-in/check-out dates, guest count, and phone number.
- Saves valid booking requests in the local SQLite database.
- Shows a success message with the selected dates after the request is saved.

This is a local demo, not a live reservation or payment system. Saving a booking does not contact a hotel, confirm availability, calculate a price, or process payment.

## Hosting publicly

This version is set up for local use. To publish it, deploy the Node server to a host that supports Node.js 22.13+ and persistent storage, then configure HTTPS, backups, and a persistent database volume. The included SQLite file is suitable for local development and a small single-instance demo, not a multi-instance production booking service. Don't commit the database, credentials, or `.env` files.
