export const parseFraction = (s) => {
  if (typeof s === "number") {
    return s;
  }
  if (!s.includes("/")) {
    return Math.floor(parseInt(s));
  }
  const [numerator, denominator] = s.split("/");
  return Math.floor(parseInt(numerator) / parseInt(denominator));
};
