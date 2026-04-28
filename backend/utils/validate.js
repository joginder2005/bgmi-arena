export const requireFields = (payload, fields) => {
  const missing = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
  return missing;
};

export const isValidObjectIdArray = (value) => Array.isArray(value) && value.every((item) => typeof item === "string");
