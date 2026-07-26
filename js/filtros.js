/***************************************************
 *
 * FILTROS.JS
 *
 ***************************************************/


//===========================================
// FILTRO GENERAL
//===========================================

function filtrarVentas(lista) {

    let resultado = [...lista];

    const fechaInicio = obtenerValor("fechaInicio");
    const fechaFin = obtenerValor("fechaFin");
    const supervisor = obtenerValor("supervisor");
    const asesor = obtenerValor("asesor");

    if (fechaInicio) {
        resultado = filtrarPorFechaInicio(resultado, fechaInicio);
    }

    if (fechaFin) {
        resultado = filtrarPorFechaFin(resultado, fechaFin);
    }

    if (supervisor) {
        resultado = filtrarPorSupervisor(resultado, supervisor);
    }

    if (asesor) {
        resultado = filtrarPorAsesor(resultado, asesor);
    }

    return resultado;

}


//===========================================
// FECHA DESDE
//===========================================

function filtrarPorFechaInicio(lista, fecha) {

    const inicio = new Date(fecha);

    return lista.filter(v => {

        if (!v.fecha) return false;

        return new Date(obtenerFecha(v.fecha)) >= inicio;

    });

}


//===========================================
// FECHA HASTA
//===========================================

function filtrarPorFechaFin(lista, fecha) {

    const fin = new Date(fecha);

    return lista.filter(v => {

        if (!v.fecha) return false;

        return new Date(obtenerFecha(v.fecha)) <= fin;

    });

}


//===========================================
// SUPERVISOR
//===========================================

function filtrarPorSupervisor(lista, supervisor) {

    supervisor = supervisor.trim().toUpperCase();

    return lista.filter(v =>
        (v.supervisor || "")
            .trim()
            .toUpperCase() === supervisor
    );

}


//===========================================
// ASESOR
//===========================================

function filtrarPorAsesor(lista, asesor) {

    asesor = asesor.trim().toUpperCase();

    return lista.filter(v =>
        (v.asesor || "")
            .trim()
            .toUpperCase() === asesor
    );

}


//===========================================
// TIPO VENTA
//===========================================

function filtrarPorTipoVenta(lista, tipo) {

    return lista.filter(v =>
        v.tipoVenta === tipo
    );

}


//===========================================
// ESTADO CRÉDITO
//===========================================

function filtrarPorEstado(lista, estado) {

    estado = estado.trim().toUpperCase();

    return lista.filter(v =>
        (v.estadoCredito || "")
            .trim()
            .toUpperCase() === estado
    );

}


//===========================================
// TEXTO
//===========================================

function filtrarPorTexto(lista, texto) {

    texto = texto.trim().toUpperCase();

    return lista.filter(v =>

        (v.asesor || "")
            .toUpperCase()
            .includes(texto)

        ||

        (v.cliente || "")
            .toUpperCase()
            .includes(texto)

    );

}


//===========================================
// RANGO DIFERENCIA
//===========================================

function filtrarPorDiferencia(lista, minimo = 0, maximo = Infinity) {

    return lista.filter(v =>

        v.diferencia >= minimo &&
        v.diferencia <= maximo

    );

}


//===========================================
// SOLO APROBADOS
//===========================================

function soloAprobados(lista) {

    return filtrarPorEstado(lista, ESTADOS.APROBADO);

}


//===========================================
// SOLO NEGADOS
//===========================================

function soloNegados(lista) {

    return filtrarPorEstado(lista, ESTADOS.NEGADO);

}


//===========================================
// LIMPIAR FILTROS
//===========================================

function limpiarFiltros() {

    [

        "fechaInicio",
        "fechaFin",
        "supervisor",
        "asesor"

    ].forEach(id => {

        const elemento = document.getElementById(id);

        if (elemento) {

            elemento.value = "";

        }

    });

}


//===========================================
// OBTENER VALOR
//===========================================

function obtenerValor(id) {

    const elemento = document.getElementById(id);

    return elemento
        ? elemento.value.trim()
        : "";

}


//===========================================
// FECHA YYYY-MM-DD
//===========================================

function obtenerFecha(fecha) {

    if (!fecha) return "";

    const f = new Date(fecha);

    if (isNaN(f)) return "";

    return f.toISOString().split("T")[0];

}