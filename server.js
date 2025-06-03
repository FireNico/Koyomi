import express from "express";
import cors from "cors";
import connection from "./models/db.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sirve recursos estáticos desde /public y /public/site
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/site")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/site", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
