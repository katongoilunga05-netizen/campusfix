const STATUSES = ["Pending", "In progress", "Completed"];

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function validateText(value, label, min, max) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return `${label} is required and must be text.`;
  }

  const length = value.trim().length;
  if (length < min || length > max) {
    return `${label} must have ${min} to ${max} characters.`;
  }

  return null;
}

/**
 * Accept only the four editable fields. A client-supplied id is ignored.
 * Values must be strings before they are trimmed.
 */
function cleanRecord(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpError(400, "Request body must be a JSON object.");
  }

  const checks = [
    ["title", "Title", 3, 80],
    ["category", "Category", 2, 40],
    ["description", "Description", 5, 300]
  ];

  for (const [field, label, min, max] of checks) {
    const message = validateText(input[field], label, min, max);
    if (message) {
      throw new HttpError(400, message);
    }
  }

  if (typeof input.status !== "string" || !STATUSES.includes(input.status.trim())) {
    throw new HttpError(400, "Status must be Pending, In progress, or Completed.");
  }

  return {
    title: input.title.trim(),
    category: input.category.trim(),
    description: input.description.trim(),
    status: input.status.trim()
  };
}

function parseId(id) {
  if (typeof id !== "string" || !/^[1-9]\d*$/.test(id)) {
    throw new HttpError(400, "Record id must be a positive whole number.");
  }

  const value = Number(id);
  if (!Number.isSafeInteger(value) || value > 2147483647) {
    throw new HttpError(400, "Record id must be a positive whole number.");
  }

  return value;
}

module.exports = { cleanRecord, parseId, HttpError };
