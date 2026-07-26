/***************************************************
 *
 * DASHBOARD.JS
 *
 ***************************************************/


//===========================================
// VARIABLES
//===========================================

let datosFiltrados = [];

let graficoSupervisor = null;

let graficoAsesor = null;


//===========================================
// INICIO
//===========================================

document.addEventListener("DOMContentLoaded", iniciar);


async function iniciar() {

    try {

        mostrarSpinner();

        await iniciarDatos();

        datosFiltrados = [...ventas];

        await cargarCombos();

        actualizarDashboard();

        eventos();

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
// EVENTOS
//===========================================

function eventos() {

    document
        .getElementById("btnFiltrar")
        ?.addEventListener("click", aplicarFiltros);

}


//===========================================
// COMBOS
//===========================================

async function cargarCombos() {

    llenarSelect(
        "supervisor",
        supervisores
    );

    llenarSelect(
        "asesor",
        asesores
    );

}


//===========================================
// FILTROS
//===========================================

function aplicarFiltros() {

    datosFiltrados = filtrarVentas(ventas);

    actualizarDashboard();

}


//===========================================
// ACTUALIZAR DASHBOARD
//===========================================

function actualizarDashboard() {

    actualizarKPIs();

    dibujarRankingSupervisores();

    dibujarRankingAsesores();

    dibujarGraficoSupervisores();

    dibujarGraficoAsesores();

}


//===========================================
// KPI
//===========================================

function actualizarKPIs() {

    const kpi = obtenerKPIs(datosFiltrados);

    document.getElementById("kpiMovil").textContent =
        formatearDinero(kpi.upMovil);

    document.getElementById("kpiMigraciones").textContent =
        kpi.migraciones;

    document.getElementById("kpiHogar").textContent =
        formatearDinero(kpi.upHogar);

    document.getElementById("kpiVentas").textContent =
        kpi.ventas;

}


//===========================================
// TABLA SUPERVISORES
//===========================================

function dibujarRankingSupervisores() {

    const tbody = document.getElementById("tablaSupervisores");

    if (!tbody) return;

    const ranking = calcularRankingSupervisor(datosFiltrados).slice(0, 10);

    let html = "";

    ranking.forEach((item, index) => {

        html += `

        <tr>

            <td>${index + 1}</td>

            <td>

                <a href="supervisor.html?id=${encodeURIComponent(item.nombre)}">

                    ${item.nombre}

                </a>

            </td>

            <td>${formatearDinero(item.upMovil)}</td>

            <td>${item.migraciones}</td>

            <td>${formatearDinero(item.upHogar)}</td>

        </tr>

        `;

    });

    tbody.innerHTML = html;

}


//===========================================
// TABLA ASESORES
//===========================================

function dibujarRankingAsesores() {

    const tbody = document.getElementById("tablaAsesores");

    if (!tbody) return;

    const ranking = calcularRankingAsesor(datosFiltrados).slice(0, 10);

    let html = "";

    ranking.forEach((item, index) => {

        html += `

        <tr>

            <td>${index + 1}</td>

            <td>

                <a href="asesor.html?id=${encodeURIComponent(item.nombre)}">

                    ${item.nombre}

                </a>

            </td>

            <td>${formatearDinero(item.upMovil)}</td>

            <td>${item.migraciones}</td>

            <td>${formatearDinero(item.upHogar)}</td>

        </tr>

        `;

    });

    tbody.innerHTML = html;

}


//===========================================
// GRÁFICO SUPERVISORES
//===========================================

function dibujarGraficoSupervisores() {

    const canvas = document.getElementById("graficoSupervisores");

    if (!canvas) return;

    const ranking = calcularRankingSupervisor(datosFiltrados).slice(0, 10);

    if (graficoSupervisor) {

        graficoSupervisor.destroy();

    }

    graficoSupervisor = new Chart(canvas, {

        type: "bar",

        data: {

            labels: ranking.map(x => x.nombre),

            datasets: [

                {

                    label: "Upgrade Móvil",

                    data: ranking.map(x => x.upMovil)

                },

                {

                    label: "Migraciones",

                    data: ranking.map(x => x.migraciones)

                },

                {

                    label: "Upgrade Hogar",

                    data: ranking.map(x => x.upHogar)

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}


//===========================================
// GRÁFICO ASESORES
//===========================================

function dibujarGraficoAsesores() {

    const canvas = document.getElementById("graficoAsesores");

    if (!canvas) return;

    const ranking = calcularRankingAsesor(datosFiltrados).slice(0, 10);

    if (graficoAsesor) {

        graficoAsesor.destroy();

    }

    graficoAsesor = new Chart(canvas, {

        type: "bar",

        data: {

            labels: ranking.map(x => x.nombre),

            datasets: [

                {

                    label: "Upgrade Móvil",

                    data: ranking.map(x => x.upMovil)

                },

                {

                    label: "Migraciones",

                    data: ranking.map(x => x.migraciones)

                },

                {

                    label: "Upgrade Hogar",

                    data: ranking.map(x => x.upHogar)

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}