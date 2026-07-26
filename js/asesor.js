/***************************************************
 *
 * ASESOR.JS
 *
 ***************************************************/


//===========================================
// VARIABLES
//===========================================

let asesor = "";

let ventasAsesor = [];



//===========================================
// INICIO
//===========================================

document.addEventListener("DOMContentLoaded", iniciar);


async function iniciar() {

    try {

        mostrarSpinner();

        await iniciarDatos();

        obtenerAsesorURL();

        cargarAsesor();

        cargarEventos();

        actualizarVista();

    }

    catch (error) {

        console.error(error);

        alert(MENSAJES.error);

    }

    finally {

        ocultarSpinner();

    }

}


//===========================================
// OBTENER ASESOR
//===========================================

function obtenerAsesorURL() {

    const params = new URLSearchParams(location.search);

    asesor = decodeURIComponent(params.get("id") || "");

}


//===========================================
// CARGAR DATOS
//===========================================

function cargarAsesor() {

    ventasAsesor = buscarAsesor(asesor);

    ventasOriginales = [...ventasAsesor];

}


//===========================================
// ACTUALIZAR VISTA
//===========================================

function actualizarVista() {

    actualizarEncabezado();

    dibujarKPIs();

    dibujarTabla();

    dibujarGraficos();

}


//===========================================
// ENCABEZADO
//===========================================

function actualizarEncabezado() {

    if (!ventasAsesor.length) return;

    const venta = ventasAsesor[0];

    document.getElementById("nombreAsesor").textContent = asesor;

    document.getElementById("supervisor").textContent =
        venta.supervisor || "-";

    document.getElementById("nombreSupervisor").textContent =
        `Supervisor: ${venta.supervisor || "-"}`;

}


//===========================================
// KPIs
//===========================================

function dibujarKPIs() {

    const kpi = obtenerKPIs(ventasAsesor);

    document.getElementById("kpiMovil").textContent =
        formatearDinero(kpi.upMovil);

    document.getElementById("kpiHogar").textContent =
        formatearDinero(kpi.upHogar);

    document.getElementById("kpiMigraciones").textContent =
        kpi.migraciones;

    document.getElementById("kpiVentas").textContent =
        kpi.ventas;

    document.getElementById("kpiComision").textContent =
        formatearDinero(kpi.total);

}


//===========================================
// TABLA
//===========================================

function dibujarTabla() {

    const tbody = document.getElementById("tablaVentas");

    if (!tbody) return;

    let html = "";

    ventasAsesor.forEach(v => {

        html += `

        <tr>

            <td>${formatearFecha(v.fechaActivacion)}</td>

            <td>${v.cliente}</td>

            <td>${v.tipoVenta}</td>

            <td>${v.tarifaAnterior}</td>

            <td>${v.tarifaNueva}</td>

            <td>${formatearDinero(v.diferencia)}</td>

            <td>

                <span class="${obtenerClaseEstado(v.estadoCredito)}">

                    ${v.estadoCredito}

                </span>

            </td>

        </tr>

        `;

    });

    tbody.innerHTML = html;

}


//===========================================
// EVENTOS
//===========================================

function cargarEventos() {

    document
        .getElementById("btnFiltrar")
        ?.addEventListener("click", aplicarFiltros);

    document
        .getElementById("btnExcel")
        ?.addEventListener("click", exportarExcel);

    document
        .getElementById("btnPDF")
        ?.addEventListener("click", exportarPDF);

}


//===========================================
// FILTROS
//===========================================

function aplicarFiltros() {

    ventasAsesor = [...ventasOriginales];

    const inicio = obtenerValor("fechaInicio");
    const fin = obtenerValor("fechaFin");
    const tipo = obtenerValor("tipoVenta");
    const estado = obtenerValor("estadoCredito");

    if (inicio) {

        ventasAsesor = filtrarPorFechaInicio(
            ventasAsesor,
            inicio
        );

    }

    if (fin) {

        ventasAsesor = filtrarPorFechaFin(
            ventasAsesor,
            fin
        );

    }

    if (tipo) {

        ventasAsesor = filtrarPorTipoVenta(
            ventasAsesor,
            tipo
        );

    }

    if (estado) {

        ventasAsesor = filtrarPorEstado(
            ventasAsesor,
            estado
        );

    }

    dibujarKPIs();

    dibujarTabla();

}


//===========================================
// GRÁFICOS
//===========================================

function dibujarGraficos() {

    // Pendiente

}