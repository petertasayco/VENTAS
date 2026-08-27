/***************************************************
 *
 * DATOS.JS
 * Gestión de datos en memoria
 *
 ***************************************************/


//===========================================
// VARIABLES GLOBALES
//===========================================

let ventas = [];

let ventasOriginales = [];

let ventasValidas = [];

let asesores = [];

let supervisores = [];

let ultimaActualizacion = null;


//===========================================
// INICIAR DATOS
//===========================================

async function iniciarDatos(force = false) {

    if (ventas.length > 0 && !force) {
        return;
    }

    const respuesta = await cargarVentas();

    ventas = respuesta;

    ventasOriginales = [...ventas];

    ventasValidas = filtrarVentasValidas(ventas);

    obtenerCatalogos();

    ultimaActualizacion = obtenerFechaActualizacion();

}


//===========================================
// CATÁLOGOS
//===========================================

function obtenerCatalogos() {

    asesores = obtenerListaUnica("asesor");

    supervisores = obtenerListaUnica("supervisor");

}


//===========================================
// LISTA ÚNICA
//===========================================

function obtenerListaUnica(campo) {

    return [...new Set(

        ventas
            .map(v => v[campo]?.trim())
            .filter(Boolean)

    )].sort((a, b) => a.localeCompare(b));

}


//===========================================
// ACTUALIZAR DATOS
//===========================================

async function actualizarDatos() {

    await iniciarDatos(true);

}


//===========================================
// OBTENER FECHA DE ACTUALIZACIÓN
//===========================================

function obtenerFechaActualizacion(){

    if(!ventas.length){
        return null;
    }


    const fechas = ventas
        .map(v => {

            return new Date(
                v["Fecha Carga"]
            );

        })
        .filter(f => !isNaN(f));


    if(!fechas.length){
        return null;
    }


    return new Date(
        Math.max(
            ...fechas.map(
                f => f.getTime()
            )
        )
    );

}


//===========================================
// BUSCAR ASESOR
//===========================================

function buscarAsesor(nombre) {

    return ventas.filter(v =>
        String(v.asesor || "").toUpperCase() ===
        String(nombre || "").toUpperCase()
    );

}


//===========================================
// BUSCAR SUPERVISOR
//===========================================

function buscarSupervisor(nombre) {

    return ventas.filter(v =>
        String(v.supervisor || "").toUpperCase() ===
        String(nombre || "").toUpperCase()
    );

}


//===========================================
// BUSCAR POR ID
//===========================================

function buscarVenta(id) {

    return ventas.find(v =>
        v.id === Number(id)
    );

}


//===========================================
// VALIDAR VENTA
//===========================================
//
// REGLA:
//
// APROBADO                    → CUENTA
// PENDIENTE BIOMETRIA        → CUENTA
// NEGADO + COMPLETADO        → CUENTA
// NEGADO + cualquier otro    → NO CUENTA
// CANCELADO                  → NO CUENTA
// Cualquier otro estado     → NO CUENTA
//
//===========================================

function esVentaValida(v) {

    const estadoCredito =
        String(v.estadoCredito || "")
            .trim()
            .toUpperCase();

    const estadoGlobal =
        String(v.estadoGlobal || v["Estado Global"] || "")
            .trim()
            .toUpperCase();


    // =========================================
    // CANCELADO → NO CUENTA
    // =========================================

    if (
        estadoCredito === "CANCELADO" ||
        estadoGlobal === "CANCELADA"
    ) {
        return false;
    }


    // =========================================
    // APROBADO → CUENTA
    // =========================================

    if (estadoCredito === "APROBADO") {
        return true;
    }


    // =========================================
    // PENDIENTE BIOMETRIA → CUENTA
    // =========================================

    if (estadoCredito === "PENDIENTE BIOMETRIA") {
        return true;
    }


    // =========================================
    // NEGADO + COMPLETADA → CUENTA
    // =========================================

    if (
        estadoCredito === "NEGADO" &&
        estadoGlobal === "COMPLETADA"
    ) {
        return true;
    }


    // =========================================
    // RESTO → NO CUENTA
    // =========================================

    return false;
}


//===========================================
// FILTRO DE VENTAS VÁLIDAS POR TIPO
//===========================================

function filtrarVentasValidas(lista){

    return lista.filter(v => {


        //-------------------------------------------
        // VALIDAR ESTADO
        //-------------------------------------------

        if(!esVentaValida(v)){

            return false;

        }


        //-------------------------------------------
        // VALIDAR TIPO DE VENTA
        //-------------------------------------------

        const tipo =

            String(v.tipoVenta || "")
                .trim()
                .toUpperCase();


        //-------------------------------------------
        // UP MOVIL
        //-------------------------------------------

        if(
            tipo === "UP GRADE MOVIL"
        ){

            return true;

        }


        //-------------------------------------------
        // UP HOGAR
        //-------------------------------------------

        if(
            tipo === "UP GRADE HOGAR"
        ){

            return true;

        }


        //-------------------------------------------
        // MIGRACIONES
        //-------------------------------------------

        if(
            tipo === "MIGRACION" ||
            tipo === "MIGRACIONES"
        ){

            return true;

        }


        return false;

    });

}


//===========================================
// OBTENER KPIs
//===========================================

function obtenerKPIs(lista){

    let movil = 0;

    let hogar = 0;

    let migraciones = 0;


    let movilNegados = 0;

    let hogarNegados = 0;

    let migracionesNegadas = 0;


    lista.forEach(v => {


        //-------------------------------------------
        // SOLO VENTAS VÁLIDAS
        //-------------------------------------------

        if(!esVentaValida(v)){

            return;

        }


        const tipo =

            String(v.tipoVenta || "")
                .trim()
                .toUpperCase();


        const diferencia =

            Number(v.diferencia) || 0;


        //-------------------------------------------
        // UP MOVIL
        //-------------------------------------------

        if(
            tipo === "UP GRADE MOVIL"
        ){

            movil += diferencia;

        }


        //-------------------------------------------
        // UP HOGAR
        //-------------------------------------------

        else if(
            tipo === "UP GRADE HOGAR"
        ){

            hogar += diferencia;

        }


        //-------------------------------------------
        // MIGRACIONES
        //-------------------------------------------

        else if(
            tipo === "MIGRACION" ||
            tipo === "MIGRACIONES"
        ){

            migraciones++;

        }


    });


    return {

        ventas: lista.filter(
            v => esVentaValida(v)
        ).length,

        upMovil: movil,

        upHogar: hogar,

        migraciones: migraciones,

        upMovilNegados: movilNegados,

        upHogarNegados: hogarNegados,

        migracionesNegadas: migracionesNegadas

    };

}


//===========================================
// RANKING DE ASESORES
//===========================================

function calcularRankingAsesor(lista){

    const ranking = {};


    lista.forEach(v => {


        //-------------------------------------------
        // SOLO VENTAS VÁLIDAS
        //-------------------------------------------

        if(!esVentaValida(v)){

            return;

        }


        const nombre = v.asesor;


        if(!nombre){

            return;

        }


        //-------------------------------------------
        // CREAR ASESOR
        //-------------------------------------------

        if(!ranking[nombre]){

            ranking[nombre] = {

                nombre,

                supervisor:
                    v.supervisor || "",

                ventas: 0,

                upMovil: 0,

                upHogar: 0,

                migraciones: 0,

                total: 0

            };

        }


        //-------------------------------------------
        // TIPO DE VENTA
        //-------------------------------------------

        const tipo =

            String(v.tipoVenta || "")
                .trim()
                .toUpperCase();


        //-------------------------------------------
        // DIFERENCIA
        //-------------------------------------------

        const diferencia =

            Number(v.diferencia) || 0;


        //-------------------------------------------
        // UP MOVIL
        //-------------------------------------------

        if(
            tipo === "UP GRADE MOVIL"
        ){

            ranking[nombre].upMovil +=
                diferencia;

        }


        //-------------------------------------------
        // UP HOGAR
        //-------------------------------------------

        else if(
            tipo === "UP GRADE HOGAR"
        ){

            ranking[nombre].upHogar +=
                diferencia;

        }


        //-------------------------------------------
        // MIGRACIONES
        //-------------------------------------------

        else if(
            tipo === "MIGRACION" ||
            tipo === "MIGRACIONES"
        ){

            ranking[nombre].migraciones++;

        }


        //-------------------------------------------
        // VENTAS
        //-------------------------------------------

        ranking[nombre].ventas++;

    });


    //-------------------------------------------
    // TOTAL
    //-------------------------------------------

    Object.values(ranking).forEach(item => {

        item.total =

            item.upMovil +

            item.upHogar;

    });


    //-------------------------------------------
    // ORDEN DEL RANKING
    //-------------------------------------------
    //
    // 1. Mayor UP Móvil
    // 2. Mayor Migraciones
    // 3. Mayor UP Hogar
    //
    //-------------------------------------------

    return Object.values(ranking)

        .sort((a,b) => {

            if(
                b.upMovil !==
                a.upMovil
            ){

                return (
                    b.upMovil -
                    a.upMovil
                );

            }


            if(
                b.migraciones !==
                a.migraciones
            ){

                return (
                    b.migraciones -
                    a.migraciones
                );

            }


            return (
                b.upHogar -
                a.upHogar
            );

        });

}


//===========================================
// RANKING DE SUPERVISORES
//===========================================

function calcularRankingSupervisor(lista){

    const ranking = {};


    lista.forEach(v => {


        //-------------------------------------------
        // SOLO VENTAS VÁLIDAS
        //-------------------------------------------

        if(!esVentaValida(v)){

            return;

        }


        const nombre =
            v.supervisor;


        if(!nombre){

            return;

        }


        //-------------------------------------------
        // CREAR SUPERVISOR
        //-------------------------------------------

        if(!ranking[nombre]){

            ranking[nombre] = {

                nombre,

                ventas: 0,

                upMovil: 0,

                upHogar: 0,

                migraciones: 0,

                total: 0

            };

        }


        //-------------------------------------------
        // TIPO
        //-------------------------------------------

        const tipo =

            String(v.tipoVenta || "")
                .trim()
                .toUpperCase();


        //-------------------------------------------
        // DIFERENCIA
        //-------------------------------------------

        const diferencia =

            Number(v.diferencia) || 0;


        //-------------------------------------------
        // UP MOVIL
        //-------------------------------------------

        if(
            tipo === "UP GRADE MOVIL"
        ){

            ranking[nombre].upMovil +=
                diferencia;

        }


        //-------------------------------------------
        // UP HOGAR
        //-------------------------------------------

        else if(
            tipo === "UP GRADE HOGAR"
        ){

            ranking[nombre].upHogar +=
                diferencia;

        }


        //-------------------------------------------
        // MIGRACIONES
        //-------------------------------------------

        else if(
            tipo === "MIGRACION" ||
            tipo === "MIGRACIONES"
        ){

            ranking[nombre].migraciones++;

        }


        //-------------------------------------------
        // VENTAS
        //-------------------------------------------

        ranking[nombre].ventas++;

    });


    //-------------------------------------------
    // TOTAL
    //-------------------------------------------

    Object.values(ranking).forEach(item => {

        item.total =

            item.upMovil +

            item.upHogar;

    });


    //-------------------------------------------
    // ORDEN
    //-------------------------------------------

    return Object.values(ranking)

        .sort((a,b) => {


            // 1. Mayor UP Móvil

            if(
                b.upMovil !==
                a.upMovil
            ){

                return (
                    b.upMovil -
                    a.upMovil
                );

            }


            // 2. Mayor Migraciones

            if(
                b.migraciones !==
                a.migraciones
            ){

                return (
                    b.migraciones -
                    a.migraciones
                );

            }


            // 3. Mayor UP Hogar

            return (
                b.upHogar -
                a.upHogar
            );

        });

}


//===========================================
// REINICIAR FILTROS
//===========================================

function restaurarVentas() {

    ventas = structuredClone(
        ventasOriginales
    );

    ventasValidas =
        filtrarVentasValidas(
            ventas
        );

}