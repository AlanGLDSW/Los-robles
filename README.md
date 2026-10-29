# Residencial-Los-Robles
Sistema de gestión administrativa para Residencial Los Robles

## Actividad: Conceptualización de servicios en la nube

Páginas publicadas: **login.html** (página principal), **index.html** (registro),
**olvide.html** (recuperar contraseña) y **homepage.html** (inicio del residente).

### Requisitos de la interfaz

| Requisito | Dónde se cumple |
|---|---|
| Todo el sitio en un contenedor | `<div class="container">` envuelve cada página |
| Un div para el header | `<div class="header">` (login, registro, recuperar) y `<div class="header-wrapper">` (homepage) |
| Logo del lado izquierdo dentro del header | `los-robles-residencial.jpg` y `robles-connect.jpg` |
| Enlace a un video de streaming en el body | Sección "Video destacado" con enlace a YouTube |
| Footer con datos de identificación | `<footer class="site-footer">`: curso, nombre, código y correo |
| Imagen de fondo | `fondo.jpg`, aplicada al `body` |

### Archivos para el despliegue

- `server.js`: servidor Node.js con Express que sirve el sitio y usa el puerto que asigna Railway (`PORT`).
- `package.json`: dependencias y comando de inicio (`npm start`).

### Probar en tu computadora

```bash
npm install
npm start
```

Después abre http://localhost:3000

### Publicar en Railway

1. Sube estos archivos a tu repositorio de GitHub.
2. Entra a https://railway.com e inicia sesión con tu cuenta de GitHub.
3. Crea un proyecto: **New Project → Deploy from GitHub repo** y elige `Residencial-Los-Robles`.
4. Railway detecta que es una app de Node.js, ejecuta `npm install` y luego `npm start`.
5. Cuando termine el despliegue, abre el servicio y ve a **Settings → Networking → Generate Domain** para obtener la URL pública.
6. Abre la URL y verifica que carguen las páginas.

### Firebase

Para que el login y el registro funcionen en el dominio de Railway, agrega ese dominio en
Firebase Console → Authentication → Settings → **Authorized domains**.
