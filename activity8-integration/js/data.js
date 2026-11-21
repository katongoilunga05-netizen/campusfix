/**
 * Activity 8 record service. The method names match Activity 6.
 * Records come from the API. This file does not use localStorage.
 */
import { API_BASE_URL } from "./config.js";

export const STATUSES = ["Pending", "In progress", "Completed"];

export function validateRecord(input) {
  const checks = [
    ["title", "Title", 3, 80],
    ["category", "Category", 2, 40],
    ["description", "Description", 5, 300]
  ];

  for (const [field, label, min, max] of checks) {
    const message = validateText(input?.[field], label, min, max);
    if (message) {
      return { message, field };
    }
  }

  if (typeof input?.status !== "string" || !STATUSES.includes(input.status.trim())) {
    return {
      message: "Status must be Pending, In progress, or Completed.",
      field: "status"
    };
  }

  return null;
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

function editableFields(record) {
  return {
    title: record.title.trim(),
    category: record.category.trim(),
    description: record.description.trim(),
    status: record.status.trim()
  };
}

async function request(path, method = "GET", body) {
  let response;
  try {
    const options = { method };
    if (body !== undefined) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error("The server could not be reached. Check that the API is running.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned a response that was not JSON.");
  }

  if (!response.ok) {
    throw new Error(data.message || "The request failed.");
  }

  return data;
}

export const recordService = {
  list() {
    return request("/api/records");
  },

  get(id) {
    return request(`/api/records/${id}`);
  },

  create(record) {
    const problem = validateRecord(record);
    if (problem) {
      throw new Error(problem.message);
    }
    return request("/api/records", "POST", editableFields(record));
  },

  update(id, record) {
    const problem = validateRecord(record);
    if (problem) {
      throw new Error(problem.message);
    }
    return request(`/api/records/${id}`, "PUT", editableFields(record));
  },

  remove(id) {
    return request(`/api/records/${id}`, "DELETE");
  }
};
