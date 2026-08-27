/***************************************************
 *
 * API.JS
 * Comunicación con Apps Script
 *
 ***************************************************/


//===========================================
// CACHE
//===========================================

let ventasCache = null;


//===========================================
// PETICIÓN GENÉRICA
//===========================================

async function request(url, options = {}) {

    try {

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const texto = await response.text();

        try {

            return JSON.parse(texto);

        } catch {

            return texto;

        }

    } catch (error) {

        console.error("Error API:", error);

        throw error;

    }

}


//===========================================
// OBTENER TODAS LAS VENTAS
//===========================================

async function cargarVentas(forzarActualizacion = false) {

    if (ventasCache && !forzarActualizacion) {
        return ventasCache;
    }

    const datos = await request(API_URL);

    ventasCache = datos.map(venta => ({

    ...venta,

    id: Number(venta.id),

    ID: Number(venta.ID),

    diferencia:
        Number(venta.diferencia || 0),

    diferenciaTarifa:
        Number(venta.diferenciaTarifa || 0),

    fecha:
        venta.fecha
            ? new Date(venta.fecha)
            : null,

    fechaRegistro:
        venta["Fecha Registro"]
            ? new Date(venta["Fecha Registro"])
            : null,

    fechaActivacion:
        venta.fechaActivacion
            ? new Date(venta.fechaActivacion)
            : null,

    fechaCarga:
        venta["Fecha Carga"]
            ? new Date(venta["Fecha Carga"])
            : null,

    asesor:
        String(venta.asesor || "")
            .trim(),

    supervisor:
        String(venta.supervisor || "")
            .trim(),

    tipoVenta:
        String(venta.tipoVenta || "")
            .trim()
            .toUpperCase(),

    estadoCredito:
        String(venta.estadoCredito || "")
            .trim()
            .toUpperCase(),

    estadoGlobal:
        String(
            venta["Estado Global"] ||
            venta.estadoGlobal ||
            ""
        )
        .trim()
        .toUpperCase()

}));

    return ventasCache;

}


//===========================================
// RECARGAR CACHE
//===========================================

async function recargarVentas() {

    ventasCache = null;

    return await cargarVentas(true);

}


//===========================================
// OBTENER UNA VENTA POR ID
//===========================================

async function obtenerVenta(id) {

    const ventas = await cargarVentas();

    const idBuscado = Number(id);

    return ventas.find(v => v.id === idBuscado) || null;

}


//===========================================
// GUARDAR CAMBIOS
//===========================================

async function guardarCambios(data) {

    const respuesta = await request(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    });

    // Actualiza la información en memoria
    await recargarVentas();

    return respuesta;

}


//===========================================
// OBTENER ASESORES
//===========================================

async function obtenerAsesores() {

    const ventas = await cargarVentas();

    return [...new Set(

        ventas
            .map(v => v.asesor)
            .filter(Boolean)

    )].sort((a, b) => a.localeCompare(b));

}


//===========================================
// OBTENER SUPERVISORES
//===========================================

async function obtenerSupervisores() {

    const ventas = await cargarVentas();

    return [...new Set(

        ventas
            .map(v => v.supervisor)
            .filter(Boolean)

    )].sort((a, b) => a.localeCompare(b));

}


//===========================================
// OBTENER ÚLTIMA ACTUALIZACIÓN
//===========================================

async function obtenerUltimaActualizacion() {

    const ventas = await cargarVentas();

    const fechas = ventas
        .map(v => v.fechaCarga)
        .filter(f => f instanceof Date && !isNaN(f));

    if (!fechas.length) {
        return null;
    }

    return new Date(Math.max(...fechas));

}


//===========================================
// LIMPIAR CACHE
//===========================================

function limpiarCache() {

    ventasCache = null;

}


//===========================================
// EXPORTAR
//===========================================

async function exportarExcel() {

    throw new Error("Función exportarExcel() aún no implementada.");

}


async function exportarPDF() {

    throw new Error("Función exportarPDF() aún no implementada.");

}


//===========================================
// HISTORIAL
//===========================================

async function obtenerHistorial() {

    return [];

}