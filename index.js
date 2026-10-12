import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as data from "./data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "..", "dist");
const messagesFile = path.join(__dirname, "messages.json");
const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// All portfolio content (edit it in server/data.js)
app.get("/api/content", (req, res) => res.json(data));

// Quote requests from the contact form are saved to server/messages.json
app.post("/api/contact", (req, res) => {
  const { name, contact, service, msg } = req.body || {};
  if (!name || !msg) return res.status(400).json({ ok: false, error: "Name and message are required." });
  const list = fs.existsSync(messagesFile) ? JSON.parse(fs.readFileSync(messagesFile, "utf8")) : [];
  list.push({ name, contact, service, msg, at: new Date().toISOString() });
  fs.writeFileSync(messagesFile, JSON.stringify(list, null, 2));
  console.log("New quote request from", name);
  res.json({ ok: true });
});

app.use(express.static(dist));
app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Portfolio running on http://localhost:${PORT}`));
