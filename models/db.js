import express from "express";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(cors());

import mysql from "mysql2";

const connection = mysql.createPool({
  host: "107.22.221.236",
  user: "koyomi",
  password: "koyominico",
  database: "koyomi",
});

app.get("/", (req, res) => {
  res.send("Hi");
});

app.listen(5000, () => {
  console.log("Server listening in http://localhost:5000");
});

app.post("/usuarios", async (req, res) => {
  try {
    const { nombre, apellido, fecha_nacimiento, correo, contrasenya } =
      req.body;
    const [{ insertId }] = await connection.promise().query(
      `INSERT INTO usuario (nombre, apellido, fecha_nacimiento, correo, contrasenya) 
          VALUES (?, ?, ?, ?, ?)`,
      [nombre, apellido, fecha_nacimiento, correo, contrasenya]
    );
    res.status(202).json({
      message: "User Created",
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

app.get("/usuarios", async (req, res) => {
  try {
    const data = await connection.promise().query(`SELECT *  from usuario;`);
    res.status(202).json({
      users: data[0],
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

app.post("/nuevoEvento", async (req, res) => {
  try {
    const { id_usuario, title, ubicacion, descripcion, start, end } = req.body;
    const [{ insertId }] = await connection.promise().query(
      `INSERT INTO evento (id_usuario, title, ubicacion, descripcion, start, end) 
          VALUES (?, ?, ?, ?, ?, ?)`,
      [id_usuario, title, ubicacion, descripcion, start, end]
    );
    res.status(202).json({
      message: "Evento Añadido",
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

app.get("/eventos", async (req, res) => {
  try {
    const data = await connection.promise().query(`SELECT * from evento;`);
    res.status(202).json({
      events: data[0],
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

app.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "El servidor está activo" });
});

app.get("/evento/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const data = await connection
      .promise()
      .query(
        "SELECT id, title, ubicacion, descripcion, start, end FROM evento WHERE id = ?",
        [id]
      );
    res.status(202).json(data[0]);
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

app.put("/evento/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, ubicacion, descripcion, start, end } = req.body;
    const [{ insertId }] = await connection.promise().query(
      `UPDATE evento 
        SET title = ?, ubicacion = ?, descripcion = ?, start = ?, end = ? 
        WHERE id = ?`,
      [title, ubicacion, descripcion, start, end, id]
    );
    res.status(200).json({
      message: "Evento actualizado correctamente",
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

export default connection;
