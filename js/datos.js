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

ventas = filtrarVentasValidas(respuesta);

ventasOriginales = [...ventas];

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

function obtenerFechaActualizacion() {

    if (!ventas.length) {
        return null;
    }

    const fechas = ventas
        .map(v => v.fechaCarga)
        .filter(f => f instanceof Date && !isNaN(f));

    if (!fechas.length) {
        return null;
    }

    return new Date(Math.max(...fechas));

}


//===========================================
// BUSCAR ASESOR
//===========================================

function buscarAsesor(nombre) {

    return ventas.filter(v =>
        v.asesor.toUpperCase() === nombre.toUpperCase()
    );

}


//===========================================
// BUSCAR SUPERVISOR
//===========================================

function buscarSupervisor(nombre) {

    return ventas.filter(v =>
        v.supervisor.toUpperCase() === nombre.toUpperCase()
    );

}


//===========================================
// BUSCAR POR ID
//===========================================

function buscarVenta(id) {

    return ventas.find(v => v.id === Number(id));

}

//===========================================
// FILTRO DE VENTAS VÁLIDAS POR TIPO
//===========================================

function filtrarVentasValidas(lista){

    return lista.filter(v=>{

        const tipo = 
            (v.tipoVenta || "")
            .toUpperCase();

        const estado =
            (v.estadoCredito || "")
            .toUpperCase()
            .trim();


        // UP MOVIL
        if(tipo === "UP GRADE MOVIL" || tipo === "UP GRADE MOVIL"){

            return estado === "APROBADO";

        }


        // UP HOGAR
        if(tipo === "UP GRADE HOGAR"){

            return estado === "APROBADO";

        }


        // MIGRACIONES
        if(tipo === "MIGRACIONES" || tipo === "MIGRACION"){

            return (
                estado === "APROBADO" ||
                estado === "PENDIENTE BIOMETRIA"
            );

        }


        return false;


    });

}

//===========================================
// OBTENER KPIs
//===========================================

function obtenerKPIs(lista) {

    let movil = 0;

    let hogar = 0;

    let migraciones = 0;

    const ventasTotal = lista.length;

    lista.forEach(v => {

        switch (v.tipoVenta) {

            case TIPOS_VENTA.MOVIL:

                movil += v.diferencia;

                break;

            case TIPOS_VENTA.HOGAR:

                hogar += v.diferencia;

                break;

            case TIPOS_VENTA.MIGRACION:

                migraciones++;

                break;

        }

    });

    return {

        ventas: ventasTotal,

        upMovil: movil,

        upHogar: hogar,

        migraciones,

        total: movil + hogar

    };

}


//===========================================
// RANKING DE ASESORES
//===========================================

function calcularRankingAsesor(lista){

    const ranking = {};

    lista = filtrarVentasValidas(lista);

    lista.forEach(v=>{

        const nombre = v.asesor;

        if(!nombre) return;


        if(!ranking[nombre]){

            ranking[nombre]={

                nombre,

                supervisor: v.supervisor || "",

                ventas:0,

                upMovil:0,

                upHogar:0,

                migraciones:0,

                total:0

            };

        }


        ranking[nombre].ventas++;


        switch(
    (v.tipoVenta || "").toLowerCase()
){

            case TIPOS_VENTA.MOVIL:

                ranking[nombre].upMovil += 
                    Number(v.diferencia) || 0;

                break;


            case TIPOS_VENTA.HOGAR:

                ranking[nombre].upHogar += 
                    Number(v.diferencia) || 0;

                break;


            case TIPOS_VENTA.MIGRACION:

                ranking[nombre].migraciones++;

                break;

        }


        ranking[nombre].total =
            ranking[nombre].upMovil +
            ranking[nombre].upHogar;


    });


    return Object.values(ranking).sort((a,b)=>{

        return (

            b.total - a.total ||

            b.upMovil - a.upMovil ||

            b.migraciones - a.migraciones ||

            b.upHogar - a.upHogar

        );

    });

}


//===========================================
// RANKING DE SUPERVISORES
//===========================================

function calcularRankingSupervisor(lista) {

    const ranking = {};

    lista.forEach(v => {

        const nombre = v.supervisor;

        if (!nombre) return;

        if (!ranking[nombre]) {

            ranking[nombre] = {

                nombre,

                ventas: 0,

                upMovil: 0,

                upHogar: 0,

                migraciones: 0,

                total: 0

            };

        }

        ranking[nombre].ventas++;

        switch (v.tipoVenta) {

            case TIPOS_VENTA.MOVIL:

                ranking[nombre].upMovil += v.diferencia;

                break;

            case TIPOS_VENTA.HOGAR:

                ranking[nombre].upHogar += v.diferencia;

                break;

            case TIPOS_VENTA.MIGRACION:

                ranking[nombre].migraciones++;

                break;

        }

    });

    Object.values(ranking).forEach(r => {

        r.total = r.upMovil + r.upHogar;

    });

    return Object.values(ranking).sort((a, b) =>

        b.total - a.total ||

        b.upMovil - a.upMovil ||

        b.migraciones - a.migraciones ||

        b.upHogar - a.upHogar

    );

}


//===========================================
// REINICIAR FILTROS
//===========================================

function restaurarVentas() {

    ventas = structuredClone(ventasOriginales);

}