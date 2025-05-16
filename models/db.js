import express from "express";
const app = express();

app.use(express.json());

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
