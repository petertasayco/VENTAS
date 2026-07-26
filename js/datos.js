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
                f=>f.getTime()
            )
        )
    );

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

function obtenerKPIs(lista){


    let movil = 0;

    let hogar = 0;

    let migraciones = 0;


    let movilNegados = 0;

    let hogarNegados = 0;

    let migracionesNegadas = 0;


    lista.forEach(v=>{


        const tipo =
            (v.tipoVenta || "")
            .toUpperCase();


        const estado =
            (v.estadoCredito || "")
            .toUpperCase();



        const aprobado =
            estado === "APROBADO";


        const negado =
            estado === "NEGADO";



        if(tipo.includes("UP GRADE MOVIL")){


            if(aprobado){

                movil += Number(v.diferencia)||0;

            }


            if(negado){

                movilNegados++;

            }


        }



        if(tipo.includes("UP GRADE HOGAR")){


            if(aprobado){

                hogar += Number(v.diferencia)||0;

            }


            if(negado){

                hogarNegados++;

            }


        }



        if(tipo.includes("MIGRACION")){


            if(
                aprobado ||
                estado==="PENDIENTE BIOMETRIA"
            ){

                migraciones++;

            }


            if(negado){

                migracionesNegadas++;

            }


        }



    });



    return {

    ventas: lista.length,

    upMovil:movil,

    upHogar:hogar,

    migraciones:migraciones,


    upMovilNegados:movilNegados,

    upHogarNegados:hogarNegados,

    migracionesNegadas:migracionesNegadas


};


}


//===========================================
// RANKING DE ASESORES
//===========================================

function calcularRankingAsesor(lista){

    const ranking = {};


    lista.forEach(v=>{


        const nombre = v.asesor;

        if(!nombre) return;


        if(!ranking[nombre]){

            ranking[nombre]={

                nombre,

                supervisor:v.supervisor || "",

                ventas:0,

                upMovil:0,

                upHogar:0,

                migraciones:0,

                total:0

            };

        }



        ranking[nombre].ventas++;



        const tipo = 
            (v.tipoVenta || "")
            .toUpperCase()
            .trim();



        const estado =
            (v.estadoCredito || "")
            .toUpperCase()
            .trim();



        // UP MOVIL

        if(
            tipo === "UP GRADE MOVIL" &&
            estado === "APROBADO"
        ){

            ranking[nombre].upMovil +=
                Number(v.diferencia) || 0;

        }



        // UP HOGAR

        if(
            tipo === "UP GRADE HOGAR" &&
            estado === "APROBADO"
        ){

            ranking[nombre].upHogar +=
                Number(v.diferencia) || 0;

        }



        // MIGRACIONES

        if(
            (tipo === "MIGRACION" ||
             tipo === "MIGRACIONES")
            &&
            (
                estado === "APROBADO" ||
                estado === "PENDIENTE BIOMETRIA"
            )
        ){

            ranking[nombre].migraciones++;

        }



        ranking[nombre].total =
            ranking[nombre].upMovil +
            ranking[nombre].upHogar;


    });



    return Object.values(ranking)
    .sort((a,b)=>{


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

function calcularRankingSupervisor(lista){


    const ranking = {};



    lista.forEach(v=>{


        const nombre = v.supervisor;


        if(!nombre) return;



        if(!ranking[nombre]){


            ranking[nombre]={

                nombre,

                ventas:0,

                upMovil:0,

                upHogar:0,

                migraciones:0,

                total:0

            };


        }



        ranking[nombre].ventas++;



        const tipo =
            (v.tipoVenta || "")
            .toUpperCase();



        const estado =
            (v.estadoCredito || "")
            .toUpperCase();



        if(tipo.includes("UP GRADE MOVIL")
        && estado==="APROBADO"){


            ranking[nombre].upMovil +=
                Number(v.diferencia)||0;


        }



        if(tipo.includes("UP GRADE HOGAR")
        && estado==="APROBADO"){


            ranking[nombre].upHogar +=
                Number(v.diferencia)||0;


        }



        if(tipo.includes("MIGRACION")
        &&
        (
            estado==="APROBADO" ||
            estado==="PENDIENTE BIOMETRIA"
        )){


            ranking[nombre].migraciones++;


        }



        ranking[nombre].total =
            ranking[nombre].upMovil +
            ranking[nombre].upHogar;



    });



    return Object.values(ranking)
    .sort((a,b)=>

        b.total-a.total ||

        b.upMovil-a.upMovil ||

        b.migraciones-a.migraciones

    );


}


//===========================================
// REINICIAR FILTROS
//===========================================

function restaurarVentas() {

    ventas = structuredClone(ventasOriginales);

}