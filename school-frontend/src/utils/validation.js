export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isNotEmpty = (val) => {
  return val !== undefined && val !== null && String(val).trim() !== "";
};
