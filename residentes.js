const API = "/api/residentes";

let residentes = []; 
let residenteAbierto = null; 

const $ = (id) => document.getElementById(id);


async function pedir(url, opciones = {}) {
  const resp = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });
  if (resp.status === 204) return null;
  let datos = null;
  try {
    datos = await resp.json();
  } catch (e) {

  }
  if (!resp.ok) {
    const err = new Error((datos && datos.error) || "Error " + resp.status);
    err.status = resp.status;
    throw err;
  }
  return datos;
}

function mostrarEstado(texto, tipo) {
  const el = $("status");
  el.textContent = texto;
  el.className = "status " + (tipo || "info");
}

function formatearFecha(valor) {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (isNaN(fecha)) return "—";
  return fecha.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function crearBadge(estado) {
  const span = document.createElement("span");
  const clase = { "al día": "al-dia", pendiente: "pendiente", moroso: "moroso" }[estado] || "pendiente";
  span.className = "badge " + clase;
  span.textContent = estado || "—";
  return span;
}

function crearBoton(texto, icono, clase, alClic) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-sm " + clase;
  btn.title = texto;
  btn.innerHTML = '<i class="fas ' + icono + '"></i> ';
  btn.appendChild(document.createTextNode(texto));
  btn.addEventListener("click", alClic);
  return btn;
}


async function cargarResidentes() {
  const tbody = $("tabla-residentes");
  tbody.innerHTML = '<tr><td colspan="5" class="empty">Cargando residentes...</td></tr>';
  try {
    residentes = await pedir(API);
    pintarTabla();
    mostrarEstado("Conectado a PostgreSQL en Railway. " + residentes.length + " registro(s) cargado(s).", "ok");
  } catch (error) {
    console.error("Error al consultar residentes:", error);
    residentes = [];
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No se pudieron cargar los datos.</td></tr>';
    $("contador").textContent = "";
    mostrarEstado("Error al consultar la base de datos: " + error.message, "error");
  }
}

function pintarTabla() {
  const tbody = $("tabla-residentes");
  const filtro = $("buscar").value.trim().toLowerCase();
  const editando = $("residente-id").value;

  const lista = residentes.filter(
    (r) =>
      !filtro ||
      (r.nombre || "").toLowerCase().includes(filtro) ||
      (r.apartamento || "").toLowerCase().includes(filtro)
  );

  tbody.innerHTML = "";

  if (lista.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.className = "empty";
    td.textContent =
      residentes.length === 0
        ? "No hay residentes registrados. Agrega el primero con el formulario."
        : "Ningún residente coincide con la búsqueda.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  lista.forEach((r) => {
    const tr = document.createElement("tr");
    if (String(r.id) === editando) tr.className = "selected";

    const tdNombre = document.createElement("td");
    tdNombre.textContent = r.nombre || "—";

    const tdCasa = document.createElement("td");
    tdCasa.textContent = r.apartamento || "—";

    const tdTel = document.createElement("td");
    tdTel.className = "col-tel";
    tdTel.textContent = r.telefono || "—";

    const tdEstado = document.createElement("td");
    tdEstado.appendChild(crearBadge(r.estado));

    const tdAcciones = document.createElement("td");
    tdAcciones.className = "acciones";
    tdAcciones.appendChild(crearBoton("Ver", "fa-eye", "btn-view", () => verResidente(r.id)));
    tdAcciones.appendChild(crearBoton("Editar", "fa-pen", "btn-edit", () => editarResidente(r.id)));
    tdAcciones.appendChild(crearBoton("Eliminar", "fa-trash", "btn-delete", () => eliminarResidente(r.id)));

    tr.append(tdNombre, tdCasa, tdTel, tdEstado, tdAcciones);
    tbody.appendChild(tr);
  });

  $("contador").textContent = "Mostrando " + lista.length + " de " + residentes.length + " residente(s).";
}


async function verResidente(id) {
  try {
    const r = await pedir(API + "/" + encodeURIComponent(id));
    residenteAbierto = r.id;
    $("d-id").textContent = r.id;
    $("d-nombre").textContent = r.nombre || "—";
    $("d-apartamento").textContent = r.apartamento || "—";
    $("d-telefono").textContent = r.telefono || "—";
    $("d-correo").textContent = r.correo || "—";
    $("d-estado").innerHTML = "";
    $("d-estado").appendChild(crearBadge(r.estado));
    $("d-fecha").textContent = formatearFecha(r.fecha_registro);
    $("d-actualizado").textContent = formatearFecha(r.fecha_actualizacion);

    $("modal").classList.add("open");
    $("modal").setAttribute("aria-hidden", "false");
    history.replaceState(null, "", "?id=" + encodeURIComponent(r.id));
  } catch (error) {
    console.error("Error al consultar el residente:", error);
    if (error.status === 404) {
      mostrarEstado("El residente con ID " + id + " no existe en la base de datos.", "error");
      history.replaceState(null, "", location.pathname);
    } else {
      mostrarEstado("No se pudo consultar el residente: " + error.message, "error");
    }
  }
}

function cerrarDetalle() {
  residenteAbierto = null;
  $("modal").classList.remove("open");
  $("modal").setAttribute("aria-hidden", "true");
  history.replaceState(null, "", location.pathname);
}


function leerFormulario() {
  return {
    nombre: $("nombre").value.trim(),
    apartamento: $("apartamento").value.trim(),
    telefono: $("telefono").value.trim(),
    correo: $("correo").value.trim(),
    estado: $("estado").value,
  };
}

function limpiarFormulario() {
  $("residente-form").reset();
  $("residente-id").value = "";
  $("form-title").textContent = "Agregar residente";
  $("btn-guardar").innerHTML = '<i class="fas fa-plus"></i> Agregar';
  $("btn-cancelar").hidden = true;
  pintarTabla();
}

async function editarResidente(id) {
  try {
    const r = await pedir(API + "/" + encodeURIComponent(id));
    $("residente-id").value = r.id;
    $("nombre").value = r.nombre || "";
    $("apartamento").value = r.apartamento || "";
    $("telefono").value = r.telefono || "";
    $("correo").value = r.correo || "";
    $("estado").value = r.estado || "al día";

    $("form-title").textContent = "Editar residente";
    $("btn-guardar").innerHTML = '<i class="fas fa-save"></i> Guardar cambios';
    $("btn-cancelar").hidden = false;
    pintarTabla();
    $("residente-form").scrollIntoView({ behavior: "smooth", block: "start" });
    $("nombre").focus();
  } catch (error) {
    console.error("Error al cargar el residente:", error);
    mostrarEstado("No se pudo cargar el residente: " + error.message, "error");
    if (error.status === 404) cargarResidentes();
  }
}

async function guardarResidente(evento) {
  evento.preventDefault();
  const datos = leerFormulario();
  const id = $("residente-id").value;

  if (!datos.nombre || !datos.apartamento) {
    alert("El nombre y la casa/departamento son obligatorios.");
    return;
  }

  const btn = $("btn-guardar");
  btn.disabled = true;
  try {
    if (id) {
      await pedir(API + "/" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify(datos) });
    } else {
      await pedir(API, { method: "POST", body: JSON.stringify(datos) });
    }
    limpiarFormulario();
    await cargarResidentes();
    mostrarEstado(id ? "Residente actualizado correctamente." : "Residente agregado correctamente.", "ok");
  } catch (error) {
    console.error("Error al guardar:", error);
    mostrarEstado("No se pudo guardar el residente: " + error.message, "error");
  } finally {
    btn.disabled = false;
  }
}


async function eliminarResidente(id) {
  const r = residentes.find((x) => x.id === id);
  const nombre = r ? r.nombre : "este residente";
  if (!confirm("¿Seguro que deseas eliminar a " + nombre + "? Esta acción no se puede deshacer.")) return;

  try {
    await pedir(API + "/" + encodeURIComponent(id), { method: "DELETE" });
    if (residenteAbierto === id) cerrarDetalle();
    if ($("residente-id").value === String(id)) limpiarFormulario();
    await cargarResidentes();
    mostrarEstado("Residente eliminado correctamente.", "ok");
  } catch (error) {
    console.error("Error al eliminar:", error);
    mostrarEstado("No se pudo eliminar el residente: " + error.message, "error");
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  $("residente-form").addEventListener("submit", guardarResidente);
  $("btn-cancelar").addEventListener("click", limpiarFormulario);
  $("btn-recargar").addEventListener("click", cargarResidentes);
  $("buscar").addEventListener("input", pintarTabla);

  $("m-cerrar").addEventListener("click", cerrarDetalle);
  $("m-editar").addEventListener("click", () => {
    const id = residenteAbierto;
    cerrarDetalle();
    editarResidente(id);
  });
  $("m-eliminar").addEventListener("click", () => eliminarResidente(residenteAbierto));
  $("modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") cerrarDetalle();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && residenteAbierto) cerrarDetalle();
  });

  await cargarResidentes();

  const idUrl = new URLSearchParams(location.search).get("id");
  if (idUrl) verResidente(idUrl);
});
