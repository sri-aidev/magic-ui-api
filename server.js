const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const componentsPath = path.join(__dirname, "components.json");
const componentDetailsDir = path.join(__dirname, "component-details");
const designSystemsPath = path.join(__dirname, "design-systems.json");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/components", (req, res) => {
  fs.readFile(componentsPath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Failed to read components.json" });
      return;
    }

    try {
      const components = JSON.parse(data);
      res.json(components);
    } catch (parseError) {
      res.status(500).json({ error: "Invalid components.json" });
    }
  });
});

app.get("/components/:id", (req, res) => {
  const filePath = path.join(componentDetailsDir, `${req.params.id}.json`);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(404).json({ error: "Component not found" });
      return;
    }

    try {
      const component = JSON.parse(data);
      res.json(component);
    } catch (parseError) {
      res.status(500).json({ error: "Invalid component schema" });
    }
  });
});

app.get("/design-systems", (req, res) => {
  fs.readFile(designSystemsPath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Failed to read design-systems.json" });
      return;
    }

    try {
      const systems = JSON.parse(data);
      res.json(systems);
    } catch (parseError) {
      res.status(500).json({ error: "Invalid design-systems.json" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Magic UI API running on http://localhost:${PORT}`);
});
