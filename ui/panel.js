const API_BASE_URL = "https://magic-ui-api.onrender.com";
const searchInput = document.getElementById("search");
const results = document.getElementById("results");
const emptyState = document.getElementById("empty-state");
const designSystemSelect = document.getElementById("design-system");
const selectionName = document.getElementById("selection-name");
const textInput = document.getElementById("text-input");
const toggleList = document.getElementById("toggle-list");
const statusEl = document.getElementById("status");

let components = [];

if (statusEl) {
  statusEl.textContent = "JS booted…";
}

window.addEventListener("error", (event) => {
  if (statusEl) {
    statusEl.textContent = `UI error: ${event.message}`;
  }
});

async function getComponents() {
  const response = await fetch(`${API_BASE_URL}/components`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Invalid response format");
  }
  return data;
}

function post(type, payload = {}) {
  const message = Object.assign({ type: type }, payload);
  parent.postMessage({ pluginMessage: message }, "*");
}

function setResultVisibility(list) {
  const cards = Array.from(results.querySelectorAll(".component-card"));
  const visibleIds = new Set(list.map((item) => item.id));
  cards.forEach((card) => {
    card.hidden = !visibleIds.has(card.dataset.id);
  });

  const anyVisible = cards.some((card) => !card.hidden);
  emptyState.hidden = anyVisible;
}

function renderResults(items) {
  results.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "component-card";
    card.dataset.id = item.id;
    card.dataset.type = item.type;

    const preview = document.createElement("img");
    preview.className = "preview";
    if (item.preview) {
      preview.src = item.preview;
    }

    const title = document.createElement("div");
    title.className = "component-name";
    title.textContent = item.name;

    const action = document.createElement("button");
    action.textContent = "Insert";
    action.dataset.id = item.id;

    card.appendChild(preview);
    card.appendChild(title);
    card.appendChild(action);
    results.appendChild(card);
  });

  setResultVisibility(items);
}

results.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-id]");
  if (!target) return;
  const item = components.find((comp) => comp.id === target.dataset.id);
  if (!item) return;
  post("insert-component", { id: item.id });
});

designSystemSelect.addEventListener("change", () => {
  post("set-design-system", { value: designSystemSelect.value });
});

textInput.addEventListener("input", () => {
  const elementId = textInput.dataset.elementId || "";
  if (!elementId) return;
  post("update-text", { elementId: elementId, value: textInput.value });
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    setResultVisibility(components);
    return;
  }
  const filtered = components.filter((item) =>
    item.name.toLowerCase().includes(query)
  );
  setResultVisibility(filtered);
});

async function loadComponents() {
  try {
    if (statusEl) statusEl.textContent = "Loading components…";
    const data = await getComponents();
    components = data.map((item) => ({
      id: item.id,
      name: item.name || "Untitled",
      type: item.type || "component",
      preview: item.preview || null,
    }));
    renderResults(components);
    if (statusEl) statusEl.textContent = `Loaded ${components.length} components`;
    if (components.length === 0) {
      emptyState.hidden = false;
      emptyState.textContent = "No components found.";
    }
  } catch (error) {
    results.innerHTML = "";
    emptyState.hidden = false;
    emptyState.textContent = "Unable to load components.";
    if (statusEl) statusEl.textContent = `Load failed: ${error.message}`;
    // eslint-disable-next-line no-console
    console.error("Load components failed", error);
  }
}

loadComponents();

function renderToggleList(toggles) {
  toggleList.innerHTML = "";
  if (!Array.isArray(toggles) || toggles.length === 0) {
    toggleList.textContent = "No toggles available.";
    return;
  }

  toggles.forEach((toggle) => {
    const row = document.createElement("label");
    row.className = "toggle";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!toggle.enabled;
    input.dataset.elementId = toggle.elementId;

    const text = document.createElement("span");
    text.textContent = toggle.label;

    input.addEventListener("change", () => {
      post("toggle-element", {
        elementId: toggle.elementId,
        enabled: input.checked,
      });
    });

    row.appendChild(input);
    row.appendChild(text);
    toggleList.appendChild(row);
  });
}

function setSelectionState(info) {
  selectionName.textContent = info.name || "None selected";
  if (info.textElementId) {
    textInput.disabled = false;
    textInput.value = info.textValue || "";
    textInput.dataset.elementId = info.textElementId;
  } else {
    textInput.disabled = true;
    textInput.value = "";
    textInput.dataset.elementId = "";
  }

  renderToggleList(info.toggles);
}

function clearSelectionState() {
  selectionName.textContent = "None selected";
  textInput.disabled = true;
  textInput.value = "";
  textInput.dataset.elementId = "";
  toggleList.textContent = "Select a component to edit toggles.";
}

window.addEventListener("message", (event) => {
  const message = event.data.pluginMessage;
  if (!message) return;

  if (message.type === "design-systems") {
    designSystemSelect.innerHTML = "";
    message.systems.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      designSystemSelect.appendChild(option);
    });
    designSystemSelect.value = message.current || "";
    return;
  }

  if (message.type === "selection-info") {
    setSelectionState(message);
    return;
  }

  if (message.type === "selection-clear") {
    clearSelectionState();
  }
});

clearSelectionState();
