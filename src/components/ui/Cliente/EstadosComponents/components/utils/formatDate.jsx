// utils/formatDate.js
export const formatDate = (dateString) => {
  if (!dateString) return '';

  // Split the date string to get YYYY-MM-DD
  const [year, month, day] = dateString.split('T')[0].split('-');

  // Return formatted date as DD/MM/YYYY
  return `${day}/${month}/${year}`;
};