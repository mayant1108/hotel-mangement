// Utility functions (optional)

export const calculateTotalPrice = (roomPricePerNight, checkInDate, checkOutDate) => {
  const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
  return roomPricePerNight * nights;
};

export const isValidDateRange = (checkIn, checkOut) => {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  return inDate < outDate && inDate >= new Date().setHours(0, 0, 0, 0);
};