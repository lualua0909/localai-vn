export const parseReviews = (str: string) => {
  const multipliers: { [key: string]: number } = {
    K: 1000,
    M: 1000000,
    B: 1000000000
  };
  const suffix = str.slice(-1).toUpperCase();
  if (multipliers[suffix]) {
    return parseFloat(str) * multipliers[suffix];
  }
  return parseFloat(str);
};
