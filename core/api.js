const API_BASE_URL = "https://magic-ui-api.onrender.com";

async function fetchComponent(componentId) {
  const response = await fetch(`${API_BASE_URL}/components/${componentId}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function fetchDesignSystems() {
  const response = await fetch(`${API_BASE_URL}/design-systems`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}
