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

export const niceVisualDecimal = (n: number | string) => {
  // Return a rounded decimal to the 2nd place with comma separated.

  // If we use toFixed() and toLocaleString() directly, the latter
  // will remove the 0 in the .50, which is kinda ugly?
  // So we only do the locale on the whole part of the decimal.
  const rounded = Number(n).toFixed(2);
  let [whole, decimal] = rounded.split(".");
  whole = Number(whole).toLocaleString();

  return whole + (decimal !== "00" ? `.${decimal}` : "");
};
