export const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return dateString;
  }
};

export const formatPercentage = (val) => {
  if (val === undefined || val === null) return "0%";
  return `${val}%`;
};
