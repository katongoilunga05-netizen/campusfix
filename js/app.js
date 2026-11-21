import { recordService, validateRecord } from "./data.js";

const form = document.querySelector("#record-form");
const formHeading = document.querySelector("#form-heading");
const formMessage = document.querySelector("#form-message");
const editingNote = document.querySelector("#editing-note");
const editingIdText = document.querySelector("#editing-id");
const saveButton = document.querySelector("#save-button");
const cancelEditButton = document.querySelector("#cancel-edit");
const titleInput = document.querySelector("#field-title");
const categoryInput = document.querySelector("#field-category");
const descriptionInput = document.querySelector("#field-description");
const statusInput = document.querySelector("#field-status");
const searchInput = document.querySelector("#search-title");
const statusFilter = document.querySelector("#filter-status");
const resultCount = document.querySelector("#result-count");
const emptyMessage = document.querySelector("#empty-message");
const recordRows = document.querySelector("#record-rows");
const viewDialog = document.querySelector("#view-dialog");
const deleteDialog = document.querySelector("#delete-dialog");
const deleteSummary = document.querySelector("#delete-summary");

const fields = {
  title: titleInput,
  category: categoryInput,
  description: descriptionInput,
  status: statusInput
};

const badgeClass = {
  Pending: "badge badge-pending",
  "In progress": "badge badge-progress",
  Completed: "badge badge-completed"
};

let allRecords = [];
let editingId = null;
let pendingDeleteId = null;

document.querySelectorAll(".sidebar a").forEach((link) => {
  link.addEventListener("click", () => {
    window.setTimeout(markCurrentSection, 0);
  });
});
window.addEventListener("hashchange", markCurrentSection);

form.addEventListener("submit", onSubmit);
cancelEditButton.addEventListener("click", cancelEdit);
searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);
recordRows.addEventListener("click", onRowClick);
document.querySelector("#view-close").addEventListener("click", () => viewDialog.close());
document.querySelector("#delete-cancel").addEventListener("click", closeDeleteDialog);
document.querySelector("#delete-confirm").addEventListener("click", confirmDelete);
deleteDialog.addEventListener("cancel", () => {
  pendingDeleteId = null;
});

markCurrentSection();
refresh();

function markCurrentSection() {
  const hash = window.location.hash || "#home";
  document.querySelectorAll(".sidebar a").forEach((link) => {
    if (link.getAttribute("href") === hash) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

async function refresh() {
  try {
    allRecords = await recordService.list();
    render();
  } catch (error) {
    showMessage(error.message || "The requests could not be loaded.", "error");
  }
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const visible = allRecords.filter((record) => {
    const titleMatches = String(record.title).toLowerCase().includes(query);
    const statusMatches = status === "" || record.status === status;
    return titleMatches && statusMatches;
  });

  document.querySelector("#stat-total").textContent = String(allRecords.length);
  document.querySelector("#stat-pending").textContent = String(countStatus("Pending"));
  document.querySelector("#stat-progress").textContent = String(countStatus("In progress"));
  document.querySelector("#stat-completed").textContent = String(countStatus("Completed"));

  resultCount.textContent = `Showing ${visible.length} of ${allRecords.length} requests`;

  recordRows.replaceChildren();
  if (visible.length === 0) {
    emptyMessage.hidden = false;
    emptyMessage.textContent = allRecords.length === 0
      ? "No maintenance requests yet. Add one with the form."
      : "No requests match your search or filter.";
  } else {
    emptyMessage.hidden = true;
  }

  for (const record of visible) {
    recordRows.append(buildRow(record));
  }
}

function countStatus(status) {
  return allRecords.filter((record) => record.status === status).length;
}

function buildRow(record) {
  const row = document.createElement("tr");
  row.append(
    cell("ID", String(record.id)),
    cell("Title", record.title),
    cell("Category", record.category),
    statusCell(record.status),
    actionsCell(record.id)
  );
  return row;
}

function cell(label, value) {
  const td = document.createElement("td");
  td.dataset.label = label;
  td.textContent = value;
  return td;
}

function statusCell(status) {
  const td = document.createElement("td");
  td.dataset.label = "Status";
  const badge = document.createElement("span");
  badge.className = badgeClass[status] || "badge";
  badge.textContent = status;
  td.append(badge);
  return td;
}

function actionsCell(id) {
  const td = document.createElement("td");
  td.dataset.label = "Actions";
  const wrap = document.createElement("div");
  wrap.className = "row-actions";
  wrap.append(
    actionButton("View", "view", id, "ghost"),
    actionButton("Edit", "edit", id, "ghost"),
    actionButton("Delete", "delete", id, "danger")
  );
  td.append(wrap);
  return td;
}

function actionButton(label, action, id, style) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = style;
  button.dataset.action = action;
  button.dataset.id = String(id);
  button.textContent = label;
  return button;
}

async function onSubmit(event) {
  event.preventDefault();
  const record = readForm();
  const problem = validateRecord(record);
  if (problem) {
    showMessage(problem.message, "error");
    fields[problem.field]?.focus();
    return;
  }

  saveButton.disabled = true;
  try {
    if (editingId === null) {
      await recordService.create(record);
      form.reset();
      showMessage("Request added.", "success");
    } else {
      const saved = await recordService.update(editingId, record);
      stopEditing();
      showMessage(`Request ${saved.id} updated.`, "success");
    }
    await refresh();
  } catch (error) {
    showMessage(error.message || "The request could not be saved.", "error");
  } finally {
    saveButton.disabled = false;
  }
}

function readForm() {
  return {
    title: titleInput.value,
    category: categoryInput.value,
    description: descriptionInput.value,
    status: statusInput.value
  };
}

function cancelEdit() {
  stopEditing();
  showMessage("Edit cancelled. The saved request was not changed.", "success");
}

function stopEditing() {
  editingId = null;
  form.reset();
  formHeading.textContent = "Add a request";
  saveButton.textContent = "Add request";
  editingNote.hidden = true;
  editingIdText.textContent = "";
  cancelEditButton.hidden = true;
}

async function onRowClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);
  if (button.dataset.action === "view") {
    await openView(id);
  } else if (button.dataset.action === "edit") {
    await startEdit(id);
  } else if (button.dataset.action === "delete") {
    await askDelete(id);
  }
}

async function openView(id) {
  try {
    const record = await recordService.get(id);
    document.querySelector("#view-id").textContent = String(record.id);
    document.querySelector("#view-title").textContent = record.title;
    document.querySelector("#view-category").textContent = record.category;
    document.querySelector("#view-description").textContent = record.description;
    document.querySelector("#view-status").textContent = record.status;
    viewDialog.showModal();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function startEdit(id) {
  try {
    const record = await recordService.get(id);
    editingId = record.id;
    titleInput.value = record.title;
    categoryInput.value = record.category;
    descriptionInput.value = record.description;
    statusInput.value = record.status;
    formHeading.textContent = "Edit request";
    saveButton.textContent = "Save changes";
    editingIdText.textContent = String(record.id);
    editingNote.hidden = false;
    cancelEditButton.hidden = false;
    showMessage(`Editing request ${record.id}. Change the fields and save.`, "success");
    document.querySelector("#manage").scrollIntoView();
    titleInput.focus();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function askDelete(id) {
  try {
    const record = await recordService.get(id);
    pendingDeleteId = record.id;
    deleteSummary.textContent = `Delete "${record.title}" (id ${record.id})? This cannot be undone.`;
    deleteDialog.showModal();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function closeDeleteDialog() {
  pendingDeleteId = null;
  deleteDialog.close();
}

async function confirmDelete() {
  const id = pendingDeleteId;
  pendingDeleteId = null;
  deleteDialog.close();
  if (id === null) {
    return;
  }

  try {
    const result = await recordService.remove(id);
    if (editingId === id) {
      stopEditing();
    }
    showMessage(result.message, "success");
    await refresh();
  } catch (error) {
    showMessage(error.message || "The request could not be deleted.", "error");
  }
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `message ${type}`;
}
