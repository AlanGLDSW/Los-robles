// Servidor web para publicar Residencial Los Robles en Railway.
// Railway asigna el puerto en la variable de entorno PORT.

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Sirve todos los archivos del sitio (HTML, CSS, JS e imágenes)
app.use(express.static(path.join(__dirname), { extensions: ["html"], index: false }));

// Página principal: el inicio de sesión
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Residencial Los Robles corriendo en el puerto ${PORT}`);
});
