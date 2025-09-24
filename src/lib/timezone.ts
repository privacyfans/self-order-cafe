// Set timezone for the application
process.env.TZ = 'Asia/Jakarta';

export const formatDateTimeJakarta = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatTimeJakarta = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatDateJakarta = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
