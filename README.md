# Residencial-Los-Robles
Sistema de gestión administrativa para Residencial Los Robles

## Materia: Conceptualización de servicios en la nube

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

### Archivos para el despliegue:

- `server.js`: servidor Node.js con Express que sirve el sitio y usa el puerto que asigna Railway (`PORT`).
- `package.json`: dependencias y comando de inicio (`npm start`).

### Se publica en Railway

1. Una vez que se suben los archivos a este repositorio de GitHub.
2. Se inicia sesión con tu cuenta de GitHub en Railway.
3. Crea un proyecto: **New Project → Deploy from GitHub repo** y elige `Los-Robles`.
4. Railway hace el despliegue.
5. Cuando termine el despliegue, abre el servicio y ve a **Settings → Networking → Generate Domain** para obtener la URL pública.
6. Abre la URL y se verifica que carguen las páginas correctamente.
7. 7 Todo OK

## Actividad 3.3: Aplicación web con base de datos (CRUD)

Página **residentes.html**: administra el padrón de residentes guardado en una
base de datos **PostgreSQL** alojada en Railway.

| Operación | En la página | API (server.js) |
|---|---|---|
| Consultar todos | Tabla "Residentes registrados" | `GET /api/residentes` |
| Consultar uno | Botón **Ver** (o `residentes.html?id=5`) | `GET /api/residentes/:id` |
| Agregar | Formulario "Agregar residente" | `POST /api/residentes` |
| Editar | Botón **Editar** | `PUT /api/residentes/:id` |
| Eliminar | Botón **Eliminar** | `DELETE /api/residentes/:id` |

La tabla `residentes` se crea sola la primera vez que arranca el servidor.

### Base de datos en Railway

1. En el proyecto de Railway: **+ New → Database → Add PostgreSQL**.
2. En el servicio de la aplicación: **Variables → New Variable**, nombre `DATABASE_URL`,
   valor `${{Postgres.DATABASE_URL}}`.
3. Railway vuelve a desplegar la aplicación y se conecta a la base de datos.
4. Los registros se pueden ver en el servicio Postgres, pestaña **Database → Data**.

