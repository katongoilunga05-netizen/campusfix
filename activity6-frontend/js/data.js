/**
 * Browser demonstration store for Activity 6.
 * The same five method names are used again in Activity 8, where they call the API.
 */

const KEY = "maintenance-demo-v1";

export const STATUSES = ["Pending", "In progress", "Completed"];

export const CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Furniture",
  "Infrastructure",
  "Cleaning",
  "Other"
];

const STARTER_RECORDS = [
  {
    id: 1,
    title: "Broken classroom light",
    category: "Electrical",
    description: "The light in Room B12 does not switch on.",
    status: "Pending"
  },
  {
    id: 2,
    title: "Leaking tap in the library",
    category: "Plumbing",
    description: "The washroom tap on the ground floor drips continuously.",
    status: "In progress"
  },
  {
    id: 3,
    title: "Loose lecture hall chair",
    category: "Furniture",
    description: "A chair in Lecture Hall 3 wobbles and is unsafe to sit on.",
    status: "Pending"
  },
  {
    id: 4,
    title: "Cracked pavement by Science Block",
    category: "Infrastructure",
    description: "The walkway outside the science block has a deep crack.",
    status: "Pending"
  },
  {
    id: 5,
    title: "Overflowing bins at the cafeteria",
    category: "Cleaning",
    description: "The bins behind the cafeteria were full this morning.",
    status: "In progress"
  },
  {
    id: 6,
    title: "Sparking socket in Lab 2",
    category: "Electrical",
    description: "A wall socket in Lab 2 sparked when a kettle was plugged in.",
    status: "Pending"
  },
  {
    id: 7,
    title: "Blocked drain near the hostel",
    category: "Plumbing",
    description: "The drain beside Hostel A was cleared and now flows freely.",
    status: "Completed"
  },
  {
    id: 8,
    title: "Broken window latch in Room C4",
    category: "Other",
    description: "The window latch in Room C4 snapped and the window will not close.",
    status: "Completed"
  }
];

/**
 * Returns an error description, or null when the four editable fields are valid.
 * Text is judged after trimming. The id is not accepted from the caller.
 */
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

function cleanRecord(input) {
  const result = validateRecord(input);
  if (result) {
    throw new Error(result.message);
  }

  return {
    title: input.title.trim(),
    category: input.category.trim(),
    description: input.description.trim(),
    status: input.status.trim()
  };
}

function parseId(id) {
  const value = typeof id === "number" ? id : Number(id);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Record id must be a positive whole number.");
  }
  return value;
}

/**
 * Read the saved list. Seed the eight examples only when the key is missing.
 * A saved empty array stays empty. This is what stops a refresh from restoring
 * records the user deleted on purpose.
 */
function loadRecords() {
  const raw = localStorage.getItem(KEY);
  if (raw === null) {
    localStorage.setItem(KEY, JSON.stringify(STARTER_RECORDS));
    return STARTER_RECORDS.map((record) => ({ ...record }));
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Saved demonstration data could not be read.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Saved demonstration data is not a list.");
  }

  return parsed;
}

function saveRecords(records) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

function nextId(records) {
  const highest = records.reduce((max, record) => {
    const id = Number(record.id);
    return Number.isInteger(id) && id > max ? id : max;
  }, 0);
  return highest + 1;
}

export const recordService = {
  async list() {
    return loadRecords();
  },

  async get(id) {
    const recordId = parseId(id);
    const found = loadRecords().find((record) => record.id === recordId);
    if (!found) {
      throw new Error("Record not found.");
    }
    return found;
  },

  async create(record) {
    const clean = cleanRecord(record);
    const records = loadRecords();
    const saved = { id: nextId(records), ...clean };
    records.push(saved);
    saveRecords(records);
    return saved;
  },

  async update(id, record) {
    const recordId = parseId(id);
    const clean = cleanRecord(record);
    const records = loadRecords();
    const index = records.findIndex((item) => item.id === recordId);
    if (index === -1) {
      throw new Error("Record not found.");
    }

    const saved = { id: records[index].id, ...clean };
    records[index] = saved;
    saveRecords(records);
    return saved;
  },

  async remove(id) {
    const recordId = parseId(id);
    const records = loadRecords();
    const next = records.filter((record) => record.id !== recordId);
    if (next.length === records.length) {
      throw new Error("Record not found.");
    }
    saveRecords(next);
    return { message: "Record deleted." };
  }
};
