import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { authenticate } from "../middlewares/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
    const { nombre, apellido, fecha_nacimiento, correo, contrasenya, imagen } =
      req.body;
    const hashedPassword = await bcrypt.hash(contrasenya, 10);
    const [{ insertId }] = await connection.promise().query(
      `INSERT INTO usuario (nombre, apellido, fecha_nacimiento, correo, contrasenya, imagen) 
          VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, fecha_nacimiento, correo, hashedPassword, imagen]
    );
    res.status(202).json({
      message: "User Created",
    });
  } catch (err) {
    console.error("Error al crear el usuario:", err.message);
    res.status(500).json({
      message: err,
    });
  }
});

// app.get("/usuarios/", authenticate, async (req, res) => {
//   const id_usuario = req.user.id;

//   try {
//     const data = await connection
//       .promise()
//       .query("SELECT * from usuario WHERE id = ?", [id_usuario]);
//     res.status(202).json(data[0]);
//   } catch (err) {
//     console.error("Error al obtener el usuario:", err.message);
//     res.status(500).json({
//       message: err,
//     });
//   }
// });

app.get("/usuarios", authenticate, async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const data = await connection.promise().query(
      `
      SELECT 
        u.id, u.nombre, u.apellido, u.correo, u.imagen,
        a.estado
      FROM usuario u
      LEFT JOIN amigos a ON (
        (a.id_usuario = u.id AND a.id_amigo = ?)
        OR
        (a.id_usuario = ? AND a.id_amigo = u.id)
      )
      WHERE u.id != ?
      `,
      [id_usuario, id_usuario, id_usuario]
    );
    console.log(data[0]);
    res.status(200).json({
      users: data[0],
    });
  } catch (err) {
    console.error("Error al obtener los usuarios:", err.message);
    res.status(500).json({
      message: err.message || err,
    });
  }
});

app.get("/solicitud", authenticate, async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const data = await connection.promise().query(
      `SELECT u.id as id, u.nombre, u.apellido, u.correo, u.imagen, a.estado
         FROM usuario u
         INNER JOIN amigos a ON u.id = a.id_usuario
         WHERE a.estado = 0 AND a.id_amigo = ?`,
      [id_usuario]
    );

    res.status(202).json({
      users: data[0],
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.get("/usuarios/existe", async (req, res) => {
  const { correo } = req.query;

  if (!correo) {
    return res.status(400).json({ message: "Correo no proporcionado" });
  }

  try {
    const [rows] = await connection
      .promise()
      .query("SELECT id FROM usuario WHERE correo = ?", [correo]);

    res.json({ existe: rows.length > 0 });
  } catch (error) {
    console.error("Error al verificar correo:", error);
    res.status(500).json({ message: "Error al verificar correo" });
  }
});

app.post("/nuevoEvento", authenticate, async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { title, ubicacion, descripcion, start, end } = req.body;
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
      message: err.message,
    });
  }
});

app.get("/eventos", authenticate, async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const data = await connection
      .promise()
      .query(
        "SELECT * FROM evento WHERE id_usuario = ? OR id_usuario IN ( SELECT id_amigo FROM amigos WHERE id_usuario = ? AND estado = 1 UNION SELECT id_usuario FROM amigos WHERE id_amigo = ? AND estado = 1 )",
        [id_usuario, id_usuario, id_usuario]
      );
    res.status(202).json({
      events: data[0],
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
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

app.put("/usuarios/foto", authenticate, async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { imagen } = req.body;
    console.log(imagen);
    const [{ insertId }] = await connection.promise().query(
      `UPDATE usuario
        SET imagen = ?
        WHERE id = ?`,
      [imagen, id_usuario]
    );
    res.status(200).json({
      message: "Usuario actualizado correctamente",
    });
  } catch (err) {
    console.error("Error al actualizar la foto de usuario:", err.message);
    res.status(500).json({
      message: err,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { correo, contrasenya } = req.body;
    const data = await connection
      .promise()
      .query(`SELECT id, contrasenya from usuario WHERE correo = ?`, [correo]);

    if (data[0].length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    const isValid = await bcrypt.compare(contrasenya, data[0][0].contrasenya);
    if (!isValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }
    const token = jwt.sign({ id: data[0][0].id }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });

    res.status(202).json({
      message: "Inicio de sesión exitoso",
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Error al iniciar sesión",
    });
  }
});

app.post("/nuevoAmigo", authenticate, async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { id_amigo, estado } = req.body;
    const [{ insertId }] = await connection.promise().query(
      `INSERT INTO amigos (id_usuario, id_amigo, estado)
          VALUES (?, ?, ?)`,
      [id_usuario, id_amigo, estado]
    );
    res.status(202).json({
      message: "Solicitud de amistad enviada",
    });
  } catch (err) {
    console.error("Error al enviar solicitud de amistad:", err.message);
    res.status(500).json({
      message: err.message,
    });
  }
});

app.delete("/solicitud/:id_amigo", authenticate, async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { id_amigo } = req.params;

    await connection.promise().query(
      `DELETE FROM amigos 
       WHERE id_usuario = ? AND id_amigo = ? AND estado = 0`,
      [id_amigo, id_usuario]
    );

    res.status(200).json({
      message: "Solicitud de amistad denegada",
    });
  } catch (err) {
    console.error("Error al denegar solicitud:", err.message);
    res.status(500).json({
      message: err.message,
    });
  }
});

app.put("/solicitud/:id_amigo", authenticate, async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { id_amigo } = req.params;

    await connection.promise().query(
      `UPDATE amigos 
       SET estado = 1 
       WHERE id_usuario = ? AND id_amigo = ? AND estado = 0`,
      [id_amigo, id_usuario]
    );

    res.status(200).json({
      message: "Solicitud de amistad aceptada",
    });
  } catch (err) {
    console.error("Error al aceptar solicitud:", err.message);
    res.status(500).json({
      message: err.message,
    });
  }
});

app.get("/usuarios/imagen", authenticate, async (req, res) => {
  const id_usuario = req.user.id;

  try {
    const data = await connection
      .promise()
      .query("SELECT imagen from usuario WHERE id = ?", [id_usuario]);
    console.log(data[0]);
    res.status(202).json(data[0]);
  } catch (err) {
    console.error("Error al obtener el usuario:", err.message);
    res.status(500).json({
      message: err,
    });
  }
});

app.put("/evento/:id/inscribirse", authenticate, async (req, res) => {
  const idEvento = req.params.id;
  const idUsuario = req.user.id;

  try {
    const [[evento]] = await connection
      .promise()
      .query("SELECT participantes FROM evento WHERE id = ?", [idEvento]);

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    let participantes = evento.participantes
      ? evento.participantes.split(",").map((id) => id.trim())
      : [];

    if (participantes.includes(idUsuario.toString())) {
      return res.status(400).json({ message: "Ya estás inscrito" });
    }

    participantes.push(idUsuario);

    await connection
      .promise()
      .query("UPDATE evento SET participantes = ? WHERE id = ?", [
        participantes.join(","),
        idEvento,
      ]);

    res.status(200).json({ message: "Inscripción exitosa" });
  } catch (err) {
    console.error("Error en la inscripción:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.get("/evento/:id/participantes", async (req, res) => {
  try {
    const [rows] = await connection
      .promise()
      .query("SELECT participantes FROM evento WHERE id = ?", [req.params.id]);

    if (!rows.length || !rows[0].participantes) {
      return res.status(200).json([]);
    }

    const participantesStr = String(rows[0].participantes);
    const ids = participantesStr
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (!ids.length) return res.status(200).json([]);

    const [usuarios] = await connection
      .promise()
      .query(`SELECT id, nombre, apellido FROM usuario WHERE id IN (?)`, [ids]);

    res.status(200).json(usuarios);
  } catch (err) {
    console.error("Error al obtener participantes:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default connection;
