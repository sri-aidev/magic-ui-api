function parseHexColor(hex) {
  if (!hex || typeof hex !== "string") return null;
  const cleaned = hex.replace("#", "").trim();
  if (![3, 6].includes(cleaned.length)) return null;
  const normalized =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : cleaned;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return { r: r / 255, g: g / 255, b: b / 255 };
}

function generateFrame(component) {
  const frame = figma.createFrame();
  frame.name = component.name || "Magic UI Frame";

  const size = component.size || {};
  const width = typeof size.width === "number" ? size.width : 200;
  const height = typeof size.height === "number" ? size.height : 120;
  frame.resizeWithoutConstraints(width, height);

  const styles = component.styles || {};
  const fillColor = parseHexColor(styles.fill || styles.color);
  if (fillColor) {
    frame.fills = [{ type: "SOLID", color: fillColor }];
  }

  if (typeof styles.radius === "number") {
    frame.cornerRadius = styles.radius;
  }

  return frame;
}

function generateElements(frame, elements, options = {}) {
  if (!Array.isArray(elements)) return;

  const startX = options.startX || 16;
  let cursorY = options.startY || 16;
  const gap = typeof options.gap === "number" ? options.gap : 10;
  const fontFamily = options.fontFamily || "Inter";

  elements.forEach((element) => {
    if (!element || !element.type) return;

    if (element.type === "text") {
      const text = figma.createText();
      text.characters = element.text || "Text";
      text.fontName = { family: fontFamily, style: "Regular" };
      text.fontSize = element.size || 12;
      text.x = startX;
      text.y = cursorY;
      if (element.id) {
        text.setPluginData("magic-element-id", element.id);
      }
      if (element.visible === false) {
        text.visible = false;
      }
      frame.appendChild(text);
      cursorY += text.height + gap;
      return;
    }

    if (element.type === "icon") {
      const icon = figma.createEllipse();
      const size = element.size || 14;
      icon.resizeWithoutConstraints(size, size);
      icon.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
      icon.x = startX;
      icon.y = cursorY;
      if (element.id) {
        icon.setPluginData("magic-element-id", element.id);
      }
      if (element.visible === false) {
        icon.visible = false;
      }
      frame.appendChild(icon);
      cursorY += size + gap;
      return;
    }

    if (element.type === "image") {
      const rect = figma.createRectangle();
      const width = element.width || frame.width - startX * 2;
      const height = element.height || 80;
      rect.resizeWithoutConstraints(width, height);
      rect.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
      rect.x = startX;
      rect.y = cursorY;
      if (element.id) {
        rect.setPluginData("magic-element-id", element.id);
      }
      if (element.visible === false) {
        rect.visible = false;
      }
      frame.appendChild(rect);
      cursorY += height + gap;
      return;
    }

    if (element.type === "divider") {
      const line = figma.createLine();
      line.resizeWithoutConstraints(frame.width - startX * 2, 1);
      line.strokes = [{ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }];
      line.strokeWeight = 1;
      line.x = startX;
      line.y = cursorY;
      if (element.id) {
        line.setPluginData("magic-element-id", element.id);
      }
      if (element.visible === false) {
        line.visible = false;
      }
      frame.appendChild(line);
      cursorY += 1 + gap;
    }
  });
}
