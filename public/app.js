const bookingForm = document.querySelector("#booking-form");
const bookingMessage = document.querySelector("#booking-message");
const checkInInput = bookingForm.elements.checkIn;
const checkOutInput = bookingForm.elements.checkOut;
const today = new Date();
const todayLocal = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);

checkInInput.min = todayLocal;
checkOutInput.min = todayLocal;

checkInInput.addEventListener("change", () => {
  checkOutInput.min = checkInInput.value || todayLocal;
  if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
    checkOutInput.value = "";
  }
});

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  bookingMessage.textContent = "";
  bookingMessage.classList.remove("success");

  const values = Object.fromEntries(new FormData(bookingForm).entries());
  values.guests = Number(values.guests);

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Could not save your booking. Please try again.");
    }

    bookingForm.reset();
    checkInInput.min = todayLocal;
    checkOutInput.min = todayLocal;
    bookingMessage.textContent =
      `Booking request received, ${data.booking.guestName}! Your stay is ${data.booking.checkIn} to ${data.booking.checkOut}. This demo does not confirm hotel availability.`;
    bookingMessage.classList.add("success");
  } catch (error) {
    bookingMessage.textContent = error.message;
  }
});
