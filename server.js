const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;


let pool = null;
if (DATABASE_URL) {

  const sinSSL = /localhost|127\.0\.0\.1|\.railway\.internal/.test(DATABASE_URL);
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: sinSSL ? false : { rejectUnauthorized: false },
  });
} else {
  console.warn("Falta la variable DATABASE_URL: la API de residentes no estará disponible.");
}

async function crearTabla() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS residentes (
      id                  SERIAL PRIMARY KEY,
      nombre              VARCHAR(80)  NOT NULL,
      apartamento         VARCHAR(20)  NOT NULL,
      telefono            VARCHAR(20),
      correo              VARCHAR(80),
      estado              VARCHAR(20)  NOT NULL DEFAULT 'al día',
      fecha_registro      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      fecha_actualizacion TIMESTAMPTZ
    )
  `);
  console.log("Tabla 'residentes' lista en PostgreSQL.");
}


app.use(express.json());

app.use((req, res, next) => {
  if (/^\/(node_modules|\.git)(\/|$)|^\/(server\.js|package(-lock)?\.json)$/i.test(req.path)) {
    return res.status(404).end();
  }
  next();
});


const ESTADOS = ["al día", "pendiente", "moroso"];

function validar(body) {
  const datos = {
    nombre: String(body.nombre || "").trim(),
    apartamento: String(body.apartamento || "").trim(),
    telefono: String(body.telefono || "").trim() || null,
    correo: String(body.correo || "").trim() || null,
    estado: String(body.estado || "al día").trim(),
  };
  if (!datos.nombre) return { error: "El nombre es obligatorio." };
  if (!datos.apartamento) return { error: "La casa o departamento es obligatorio." };
  if (datos.nombre.length > 80) return { error: "El nombre admite máximo 80 caracteres." };
  if (datos.apartamento.length > 20) return { error: "La casa admite máximo 20 caracteres." };
  if (datos.telefono && datos.telefono.length > 20) return { error: "El teléfono admite máximo 20 caracteres." };
  if (datos.correo && datos.correo.length > 80) return { error: "El correo admite máximo 80 caracteres." };
  if (!ESTADOS.includes(datos.estado)) return { error: "Estado de pago no válido." };
  return { datos };
}

function idValido(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "ID no válido." });
    return null;
  }
  return id;
}

const api = express.Router();

api.use((req, res, next) => {
  if (!pool) return res.status(503).json({ error: "La base de datos no está configurada (falta DATABASE_URL)." });
  next();
});

api.get("/residentes", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM residentes ORDER BY nombre ASC");
    res.json(rows);
  } catch (e) { next(e); }
});

api.get("/residentes/:id", async (req, res, next) => {
  const id = idValido(req, res); if (!id) return;
  try {
    const { rows } = await pool.query("SELECT * FROM residentes WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Residente no encontrado." });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

api.post("/residentes", async (req, res, next) => {
  const { datos, error } = validar(req.body || {});
  if (error) return res.status(400).json({ error });
  try {
    const { rows } = await pool.query(
      `INSERT INTO residentes (nombre, apartamento, telefono, correo, estado)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [datos.nombre, datos.apartamento, datos.telefono, datos.correo, datos.estado]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

api.put("/residentes/:id", async (req, res, next) => {
  const id = idValido(req, res); if (!id) return;
  const { datos, error } = validar(req.body || {});
  if (error) return res.status(400).json({ error });
  try {
    const { rows } = await pool.query(
      `UPDATE residentes
          SET nombre = $1, apartamento = $2, telefono = $3, correo = $4, estado = $5,
              fecha_actualizacion = NOW()
        WHERE id = $6
      RETURNING *`,
      [datos.nombre, datos.apartamento, datos.telefono, datos.correo, datos.estado, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Residente no encontrado." });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

api.delete("/residentes/:id", async (req, res, next) => {
  const id = idValido(req, res); if (!id) return;
  try {
    const { rowCount } = await pool.query("DELETE FROM residentes WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Residente no encontrado." });
    res.status(204).end();
  } catch (e) { next(e); }
});

app.use("/api", api);

app.use("/api", (err, req, res, next) => {
  console.error("Error en la API:", err);
  res.status(500).json({ error: "Error en la base de datos: " + err.message });
});


app.use(express.static(path.join(__dirname), { extensions: ["html"], index: false }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});


async function iniciar() {
  if (pool) {
    try {
      await crearTabla();
    } catch (e) {
      console.error("No se pudo preparar la base de datos:", e.message);
    }
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Residencial Los Robles corriendo en el puerto ${PORT}`);
  });
}

iniciar();
