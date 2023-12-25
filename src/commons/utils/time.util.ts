export const convertTime = (date: Date, format: string = "$3-$1-$2") => {
  // TODO: Maybe make a builder to make this clearer?
  // something to consider: https://www.tutorialrepublic.com/faq/how-to-format-javascript-date-as-yyyy-mm-dd.php
  return date
    .toLocaleDateString("en-us", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "America/Los_Angeles",
    })
    .replace(/(\d+)\/(\d+)\/(\d+)/, format);
};

export const convertTimeToText = (date: Date) => {
  return date.toLocaleDateString("en-us", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};
