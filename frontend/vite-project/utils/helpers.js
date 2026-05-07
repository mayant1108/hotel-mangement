export const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

export const getHotelImage = (hotel) => (
  hotel?.images?.[0]
  || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
);

export const getRoomImage = (room) => (
  room?.images?.[0]
  || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
);

export const shorten = (value, maxLength = 120) => {
  if (!value) {
    return 'No description available yet.';
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
};

export const toTitleCase = (value) => {
  if (!value) {
    return '';
  }

  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((chunk) => `${chunk[0].toUpperCase()}${chunk.slice(1)}`)
    .join(' ');
};

export const buildBookingDates = () => {
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(checkIn.getDate() + 1);

  const checkOut = new Date(today);
  checkOut.setDate(checkOut.getDate() + 2);

  const format = (date) => date.toISOString().slice(0, 10);

  return {
    checkInDate: format(checkIn),
    checkOutDate: format(checkOut),
  };
};
