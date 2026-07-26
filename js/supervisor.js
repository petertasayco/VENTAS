/***************************************************
 *
 * SUPERVISOR.JS
 *
 ***************************************************/


//===========================================
// VARIABLES
//===========================================

let supervisorActual = "";

let ventasSupervisor = [];

let ventasSupervisorOriginal = [];

let rankingEquipo = [];


//===========================================
// INICIO
//===========================================

document.addEventListener("DOMContentLoaded", iniciar);


async function iniciar() {

    try {

        mostrarSpinner();

        await iniciarDatos();

        obtenerSupervisorURL();

        cargarSupervisor();

        calcularKPIs();

        dibujarRankingEquipo();

        dibujarTablaVentas();

        cargarEventos();

    }

    catch (error) {

        console.error("Error supervisor:", error);

        mostrarToast(MENSAJES.error, "error");

    }

    finally {

        ocultarSpinner();

    }

}


//===========================================
// OBTENER SUPERVISOR URL
//===========================================

function obtenerSupervisorURL() {

    const params = new URLSearchParams(window.location.search);

    supervisorActual = decodeURIComponent(
        params.get("id") || ""
    );

}


//===========================================
// CARGAR DATOS
//===========================================

function cargarSupervisor() {

    ventasSupervisor = buscarSupervisor(supervisorActual);

    ventasSupervisorOriginal = [...ventasSupervisor];

    rankingEquipo = calcularRankingAsesor(ventasSupervisor);

}


//===========================================
// INFORMACIÓN
//===========================================

function actualizarInformacion() {

    document.getElementById("nombreSupervisor").textContent =
        supervisorActual || "-";

    document.getElementById("cantidadAsesores").textContent =
        rankingEquipo.length;

}


//===========================================
// KPI
//===========================================

function calcularKPIs() {

    actualizarInformacion();

    const kpi = obtenerKPIs(ventasSupervisor);

    document.getElementById("kpiVentas").textContent =
        kpi.ventas;

    document.getElementById("kpiMovil").textContent =
        formatearDinero(kpi.upMovil);

    document.getElementById("kpiHogar").textContent =
        formatearDinero(kpi.upHogar);

    document.getElementById("kpiMigraciones").textContent =
        kpi.migraciones;

    document.getElementById("kpiTotal").textContent =
        formatearDinero(kpi.total);

}


//===========================================
// RANKING
//===========================================

function dibujarRankingEquipo() {

    const tbody =
        document.getElementById("tablaAsesores");

    if (!tbody) return;

    let html = "";

    rankingEquipo.forEach((asesor, index) => {

        html += `

        <tr class="${clasePosicion(index + 1)}">

            <td>${medalla(index + 1)}</td>

            <td>

                <a href="asesor.html?id=${encodeURIComponent(asesor.nombre)}">

                    ${asesor.nombre}

                </a>

            </td>

            <td>${formatearDinero(asesor.upMovil)}</td>

            <td>${asesor.migraciones}</td>

            <td>${formatearDinero(asesor.upHogar)}</td>

            <td>${formatearDinero(asesor.total)}</td>

        </tr>

        `;

    });

    tbody.innerHTML = html;

}


//===========================================
// TABLA VENTAS
//===========================================

function dibujarTablaVentas() {

    const tbody =
        document.getElementById("tablaVentas");

    if (!tbody) return;

    let html = "";

    ventasSupervisor.forEach(v => {

        html += `

        <tr>

            <td>${formatearFecha(v.fechaActivacion)}</td>

            <td>${v.asesor}</td>

            <td>${v.tipoVenta}</td>

            <td>${v.cliente}</td>

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
// FILTRAR
//===========================================

function aplicarFiltros() {

    const datos =
        filtrarVentas(ventasSupervisorOriginal);

    ventasSupervisor = [...datos];

    rankingEquipo =
        calcularRankingAsesor(ventasSupervisor);

    calcularKPIs();

    dibujarRankingEquipo();

    dibujarTablaVentas();

}


//===========================================
// CLASE POSICIÓN
//===========================================

function clasePosicion(posicion) {

    if (posicion === 1) return "top1";

    if (posicion === 2) return "top2";

    if (posicion === 3) return "top3";

    return "";

}


//===========================================
// MEDALLAS
//===========================================

function medalla(posicion) {

    switch (posicion) {

        case 1:
            return "🥇";

        case 2:
            return "🥈";

        case 3:
            return "🥉";

        default:
            return posicion;

    }

}