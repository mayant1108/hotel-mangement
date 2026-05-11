export const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

export const resolveEntityId = (entity) => entity?._id || entity?.id || '';

export const getPrimaryImage = (entity) => {
  if (!Array.isArray(entity?.images)) {
    return '';
  }

  return entity.images.find(Boolean) || '';
};

export const buildHotelLocation = (hotel) => [hotel?.city, hotel?.state].filter(Boolean).join(', ');

export const collectUniqueValues = (...valueGroups) => Array.from(
  new Set(
    valueGroups
      .flat()
      .filter(Array.isArray)
      .flatMap((items) => items)
      .map((item) => item?.trim?.() || '')
      .filter(Boolean),
  ),
);
