// Files for shared functionality

/**
 * Shortens description to 100 characters.
 * @param {String} longDescription String that is about to be shorten.
 * @returns Shorten description with up to 100 characters
 */
export const createShortDescription = (longDescription) => {
  if (typeof longDescription === "string" || longDescription instanceof String) {
    if (longDescription.length > 100) {
      return longDescription.substring(0, 100) + "...";
    } else {
      return longDescription;
    }
  }
};

/**
 * Shortens UUID to display just the last part
 * @param {String} fullUUID Full UUID string
 * @returns Shortened UUID, replace first 24 characters with three stars.
 */
export const createShortUUID = (fullUUID) => {
  if (fullUUID.length > 12) {
    return "∗∗∗-" + fullUUID.substring(24);
  }
  return fullUUID;
};

/** Transform table name by removing 'dbo.' prefix.
 * @param {String} fullTableName: full table name, typically dbo.TableWhatever
 * @returns transformed table name by removing 'dbo.' prefix.
 */
export const createShortTableName = (fullTableName) => {
  if (fullTableName.length > 4) {
    if (fullTableName.startsWith("dbo.")) {
      return fullTableName.substring(4);
    }
  }
  return fullTableName;
};

/**
 * Format ISO date-time string into the format YYYY-MM-DD HH:MMM
 * @param {*} dateTimeString ISO date time string
 * @returns date and time in the format YYYY-MM-DD HH:MMM
 */
export const parseDateTime = (dateTimeString) => {
  let date = new Date(dateTimeString);
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0") +
    " (" +
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0") +
    ")"
  );
};
