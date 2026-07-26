/***************************************************
 *
 * RANKING.JS
 *
 ***************************************************/


//===========================================
// VARIABLES
//===========================================

let rankingActual = [];
let paginaActual = 1;


//===========================================
// INICIO
//===========================================

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {

    try {

        mostrarSpinner();

        await iniciarDatos();

        mostrarUltimaActualizacion();

        rankingActual = calcularRankingAsesor(ventasValidas);

        cargarEventos();

        actualizarRanking();

    } catch (error) {

        console.error(error);

        alert(MENSAJES.error);

    } finally {

        ocultarSpinner();

    }

}


//===========================================
// EVENTOS
//===========================================

function cargarEventos() {

    document.getElementById("btnFiltrar")
        ?.addEventListener("click", aplicarFiltros);

    document.getElementById("buscar")
        ?.addEventListener("input", buscarAsesor);

    document.getElementById("btnAnterior")
        ?.addEventListener("click", paginaAnterior);

    document.getElementById("btnSiguiente")
        ?.addEventListener("click", siguientePagina);

    document.getElementById("btnExcel")
        ?.addEventListener("click", exportarExcel);

    document.getElementById("btnPDF")
        ?.addEventListener("click", exportarPDF);

}


//===========================================
// FILTRAR
//===========================================

function aplicarFiltros() {

    const datos = filtrarVentas(ventas);

    rankingActual = calcularRankingAsesor(datos);

    paginaActual = 1;

    actualizarRanking();

}


//===========================================
// BUSCAR
//===========================================

function buscarAsesor(e) {

    const texto = e.target.value.trim().toUpperCase();

    const datos = filtrarVentas(ventas);

    rankingActual = calcularRankingAsesor(datos)
        .filter(item =>
            item.nombre.toUpperCase().includes(texto)
        );

    paginaActual = 1;

    actualizarRanking();

}


//===========================================
// ACTUALIZAR
//===========================================

function actualizarRanking() {

    actualizarResumen();

    dibujarTabla();

    actualizarPaginacion();

}


//===========================================
// RESUMEN
//===========================================

function actualizarResumen() {

    const total = document.getElementById("totalAsesores");
    const primero = document.getElementById("primerLugar");

    if (total) {
        total.textContent = rankingActual.length;
    }

    if (primero) {
        primero.textContent = rankingActual.length
            ? rankingActual[0].nombre
            : "-";
    }

}


//===========================================
// TABLA
//===========================================

function dibujarTabla() {

    const tbody = document.getElementById("tablaRanking");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!rankingActual.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    ${MENSAJES.sinDatos}
                </td>
            </tr>
        `;

        return;

    }

    const inicio = (paginaActual - 1) * PAGINACION.filasPorPagina;
    const fin = inicio + PAGINACION.filasPorPagina;

    let html = "";

    rankingActual
        .slice(inicio, fin)
        .forEach((item, index) => {

            const posicion = inicio + index + 1;

            html += `

            <tr class="${claseTop(posicion)}">

                <td>${medalla(posicion)}</td>

                <td>
                    <a href="asesor.html?id=${encodeURIComponent(item.nombre)}">
                        ${item.nombre}
                    </a>
                </td>

                <td>${item.supervisor || "-"}</td>

                <td>${formatearDinero(item.upMovil)}</td>

                <td>${item.migraciones}</td>

                <td>${formatearDinero(item.upHogar)}</td>

                <td>${formatearDinero(item.total)}</td>

            </tr>

            `;

        });

    tbody.innerHTML = html;

}


//===========================================
// PAGINACIÓN
//===========================================

function actualizarPaginacion() {

    const totalPaginas = Math.max(
        1,
        Math.ceil(rankingActual.length / PAGINACION.filasPorPagina)
    );

    document.getElementById("paginaActual").textContent =
        `${paginaActual} / ${totalPaginas}`;

    const btnAnterior = document.getElementById("btnAnterior");
    const btnSiguiente = document.getElementById("btnSiguiente");

    if (btnAnterior) {
        btnAnterior.disabled = paginaActual === 1;
    }

    if (btnSiguiente) {
        btnSiguiente.disabled = paginaActual === totalPaginas;
    }

}


//===========================================
// SIGUIENTE
//===========================================

function siguientePagina() {

    const totalPaginas = Math.max(
        1,
        Math.ceil(rankingActual.length / PAGINACION.filasPorPagina)
    );

    if (paginaActual >= totalPaginas) {
        return;
    }

    paginaActual++;

    actualizarRanking();

}


//===========================================
// ANTERIOR
//===========================================

function paginaAnterior() {

    if (paginaActual <= 1) {
        return;
    }

    paginaActual--;

    actualizarRanking();

}


//===========================================
// TOP
//===========================================

function claseTop(posicion) {

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