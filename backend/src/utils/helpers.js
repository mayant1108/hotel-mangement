export const calculateTotalPrice = (roomPricePerNight, checkInDate, checkOutDate) => {
  const nights = Math.ceil(
    (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24),
  );

  return roomPricePerNight * Math.max(nights, 1);
};

export const isValidDateRange = (checkIn, checkOut) => {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(inDate.valueOf())
    && !Number.isNaN(outDate.valueOf())
    && inDate < outDate
    && inDate >= today;
};
