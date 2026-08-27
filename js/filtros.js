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

    //===========================================
    // FECHA DESDE
    //===========================================

    if (fechaInicio) {

        resultado = filtrarPorFechaInicio(
            resultado,
            fechaInicio
        );

    }


    //===========================================
    // FECHA HASTA
    //===========================================

    if (fechaFin) {

        resultado = filtrarPorFechaFin(
            resultado,
            fechaFin
        );

    }


    //===========================================
    // SUPERVISOR
    //===========================================

    if (supervisor) {

        resultado = filtrarPorSupervisor(
            resultado,
            supervisor
        );

    }


    //===========================================
    // ASESOR
    //===========================================

    if (asesor) {

        resultado = filtrarPorAsesor(
            resultado,
            asesor
        );

    }


    return resultado;

}



//===========================================
// FECHA DESDE
//===========================================

function filtrarPorFechaInicio(lista, fecha) {

    return lista.filter(v => {

        const fechaVenta =
            obtenerFechaCalendario(
                v.fechaActivacion || v.fecha
            );

        if (!fechaVenta) {
            return false;
        }

        return fechaVenta >= fecha;

    });

}



//===========================================
// FECHA HASTA
//===========================================

function filtrarPorFechaFin(lista, fecha) {

    return lista.filter(v => {

        const fechaVenta =
            obtenerFechaCalendario(
                v.fechaActivacion || v.fecha
            );

        if (!fechaVenta) {
            return false;
        }

        return fechaVenta <= fecha;

    });

}



//===========================================
// OBTENER FECHA CALENDARIO
//===========================================
//
// IMPORTANTE:
//
// NO usamos toISOString()
// para evitar problemas UTC.
//
//===========================================

function obtenerFechaCalendario(fecha) {

    if (!fecha) {
        return "";
    }


    //===========================================
    // SI YA ES DATE
    //===========================================

    if (fecha instanceof Date) {

        if (isNaN(fecha.getTime())) {
            return "";
        }


        const año =
            fecha.getFullYear();

        const mes =
            String(
                fecha.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                fecha.getDate()
            ).padStart(2, "0");


        return `${año}-${mes}-${dia}`;

    }


    //===========================================
    // TEXTO
    //===========================================

    const texto =
        String(fecha).trim();


    //===========================================
    // ISO
    //===========================================
    //
    // Ejemplo:
    //
    // 2026-08-01T05:00:00.000Z
    //
    // Tomamos directamente 2026-08-01.
    //
    //===========================================

    if (
        texto.length >= 10 &&
        /^\d{4}-\d{2}-\d{2}/.test(texto)
    ) {

        return texto.substring(0, 10);

    }


    //===========================================
    // OTROS FORMATOS
    //===========================================

    const fechaObjeto =
        new Date(texto);


    if (
        isNaN(
            fechaObjeto.getTime()
        )
    ) {

        return "";

    }


    const año =
        fechaObjeto.getFullYear();

    const mes =
        String(
            fechaObjeto.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            fechaObjeto.getDate()
        ).padStart(2, "0");


    return `${año}-${mes}-${dia}`;

}



//===========================================
// SUPERVISOR
//===========================================

function filtrarPorSupervisor(
    lista,
    supervisor
) {

    supervisor =
        String(supervisor || "")
            .trim()
            .toUpperCase();


    return lista.filter(v =>

        String(v.supervisor || "")
            .trim()
            .toUpperCase() === supervisor

    );

}



//===========================================
// ASESOR
//===========================================

function filtrarPorAsesor(
    lista,
    asesor
) {

    asesor =
        String(asesor || "")
            .trim()
            .toUpperCase();


    return lista.filter(v =>

        String(v.asesor || "")
            .trim()
            .toUpperCase() === asesor

    );

}



//===========================================
// TIPO VENTA
//===========================================

function filtrarPorTipoVenta(
    lista,
    tipo
) {

    tipo =
        String(tipo || "")
            .trim()
            .toUpperCase();


    return lista.filter(v =>

        String(v.tipoVenta || "")
            .trim()
            .toUpperCase() === tipo

    );

}



//===========================================
// ESTADO CRÉDITO
//===========================================

function filtrarPorEstado(
    lista,
    estado
) {

    estado =
        String(estado || "")
            .trim()
            .toUpperCase();


    return lista.filter(v =>

        String(v.estadoCredito || "")
            .trim()
            .toUpperCase() === estado

    );

}



//===========================================
// ESTADO GLOBAL
//===========================================

function filtrarPorEstadoGlobal(
    lista,
    estado
) {

    estado =
        String(estado || "")
            .trim()
            .toUpperCase();


    return lista.filter(v =>

        String(
            v.estadoGlobal ||
            v["Estado Global"] ||
            ""
        )
        .trim()
        .toUpperCase() === estado

    );

}



//===========================================
// SOLO VENTAS QUE CUENTAN
//===========================================
//
// Utiliza la regla central de datos.js:
//
// APROBADO                  → CUENTA
// PENDIENTE BIOMETRIA      → CUENTA
// NEGADO + COMPLETADA      → CUENTA
// CANCELADO                → NO CUENTA
// CANCELADA                → NO CUENTA
//
//===========================================

function filtrarVentasValidas(lista) {

    return lista.filter(v =>
        esVentaValida(v)
    );

}



//===========================================
// SOLO APROBADOS
//===========================================

function soloAprobados(lista) {

    return filtrarPorEstado(
        lista,
        "APROBADO"
    );

}



//===========================================
// SOLO NEGADOS
//===========================================

function soloNegados(lista) {

    return filtrarPorEstado(
        lista,
        "NEGADO"
    );

}



//===========================================
// SOLO PENDIENTE BIOMETRIA
//===========================================

function soloPendienteBiometria(lista) {

    return filtrarPorEstado(
        lista,
        "PENDIENTE BIOMETRIA"
    );

}



//===========================================
// SOLO COMPLETADAS
//===========================================

function soloCompletadas(lista) {

    return filtrarPorEstadoGlobal(
        lista,
        "COMPLETADA"
    );

}



//===========================================
// SOLO CANCELADAS
//===========================================

function soloCanceladas(lista) {

    return filtrarPorEstadoGlobal(
        lista,
        "CANCELADA"
    );

}



//===========================================
// TEXTO
//===========================================

function filtrarPorTexto(
    lista,
    texto
) {

    texto =
        String(texto || "")
            .trim()
            .toUpperCase();


    return lista.filter(v =>

        String(v.asesor || "")
            .toUpperCase()
            .includes(texto)

        ||

        String(v.cliente || "")
            .toUpperCase()
            .includes(texto)

    );

}



//===========================================
// RANGO DIFERENCIA
//===========================================

function filtrarPorDiferencia(
    lista,
    minimo = 0,
    maximo = Infinity
) {

    return lista.filter(v => {

        const diferencia =
            Number(v.diferencia) || 0;


        return (
            diferencia >= minimo &&
            diferencia <= maximo
        );

    });

}



//===========================================
// LIMPIAR FILTROS
//===========================================

function limpiarFiltros() {

    [

        "fechaInicio",
        "fechaFin",
        "supervisor",
        "asesor",
        "tipoVenta",
        "estadoCredito",
        "estadoGlobal"

    ].forEach(id => {

        const elemento =
            document.getElementById(id);


        if (elemento) {

            elemento.value = "";

        }

    });

}



//===========================================
// OBTENER VALOR
//===========================================

function obtenerValor(id) {

    const elemento =
        document.getElementById(id);


    return elemento
        ? elemento.value.trim()
        : "";

}



//===========================================
// FECHA YYYY-MM-DD
//===========================================
//
// Compatibilidad con otras partes
// del proyecto.
//
//===========================================

function obtenerFecha(fecha) {

    return obtenerFechaCalendario(fecha);

}