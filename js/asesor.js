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

let ventasOriginales = [];

let chartTipos = null;

let chartEvolucion = null;



//===========================================
// INICIO
//===========================================

document.addEventListener(
    "DOMContentLoaded",
    iniciar
);



async function iniciar(){

    try{

        mostrarSpinner();


        await iniciarDatos();


        mostrarUltimaActualizacion();


        obtenerAsesorURL();


        cargarAsesor();


        cargarEventos();


        actualizarVista();


    }
    catch(error){

        console.error(
            "Error asesor:",
            error
        );

        alert(
            MENSAJES.error
        );

    }
    finally{

        ocultarSpinner();

    }

}



//===========================================
// OBTENER ASESOR
//===========================================

function obtenerAsesorURL(){

    const params =
        new URLSearchParams(
            location.search
        );


    asesor =
        decodeURIComponent(
            params.get("id") || ""
        );

}



//===========================================
// CARGAR DATOS
//===========================================

function cargarAsesor(){

    ventasAsesor =
        buscarAsesor(
            asesor
        );


    ventasOriginales =
        [...ventasAsesor];

}



//===========================================
// ACTUALIZAR VISTA
//===========================================

function actualizarVista(){

    actualizarEncabezado();

    dibujarKPIs();

    dibujarTabla();

    dibujarGraficos();

}



//===========================================
// ENCABEZADO
//===========================================

function actualizarEncabezado(){

    if(!ventasAsesor.length)
        return;


    const venta =
        ventasAsesor[0];


    document.getElementById(
        "nombreAsesor"
    ).textContent =
        asesor;



    document.getElementById(
        "supervisor"
    ).textContent =
        venta.supervisor || "-";



    document.getElementById(
        "nombreSupervisor"
    ).textContent =
        `Supervisor: ${venta.supervisor || "-"}`;

}



//===========================================
// KPIs
//===========================================

function dibujarKPIs(){

    const kpi =
        obtenerKPIs(
            ventasAsesor
        );


    document.getElementById("kpiMovil").textContent =
        formatearDinero(
            kpi.upMovil
        );


    document.getElementById("kpiHogar").textContent =
        formatearDinero(
            kpi.upHogar
        );


    document.getElementById("kpiMigraciones").textContent =
        kpi.migraciones;



    document.getElementById("kpiVentas").textContent =
        kpi.ventas;



    document.getElementById("kpiComision").textContent =
        formatearDinero(
            kpi.total
        );

}



//===========================================
// TABLA
//===========================================

function dibujarTabla(){

    const tbody =
        document.getElementById(
            "tablaVentas"
        );


    if(!tbody)
        return;


    let html="";


    ventasAsesor.forEach(v=>{


        html += `

        <tr>

            <td>
                ${formatearFecha(v.fechaActivacion)}
            </td>

            <td>
                ${v.cliente || "-"}
            </td>

            <td>
                ${v.tipoVenta || "-"}
            </td>

            <td>
                ${v.tarifaAnterior || "-"}
            </td>

            <td>
                ${v.tarifaNueva || "-"}
            </td>

            <td>
                ${formatearDinero(v.diferencia)}
            </td>


            <td>

                <span class="${obtenerClaseEstado(v.estadoCredito)}">

                    ${v.estadoCredito}

                </span>

            </td>


        </tr>

        `;


    });


    tbody.innerHTML =
        html;

}



//===========================================
// EVENTOS
//===========================================

function cargarEventos(){


    document
    .getElementById("btnFiltrar")
    ?.addEventListener(
        "click",
        aplicarFiltros
    );


}



//===========================================
// FILTROS
//===========================================

function aplicarFiltros(){

    ventasAsesor =
        [...ventasOriginales];


    const inicio =
        obtenerValor(
            "fechaInicio"
        );


    const fin =
        obtenerValor(
            "fechaFin"
        );


    const tipo =
        obtenerValor(
            "tipoVenta"
        );


    const estado =
        obtenerValor(
            "estadoCredito"
        );



    if(inicio){

        ventasAsesor =
            filtrarPorFechaInicio(
                ventasAsesor,
                inicio
            );

    }



    if(fin){

        ventasAsesor =
            filtrarPorFechaFin(
                ventasAsesor,
                fin
            );

    }



    if(tipo){

        ventasAsesor =
            filtrarPorTipoVenta(
                ventasAsesor,
                tipo
            );

    }



    if(estado){

        ventasAsesor =
            filtrarPorEstado(
                ventasAsesor,
                estado
            );

    }



    dibujarKPIs();

    dibujarTabla();

    dibujarGraficos();

}



//===========================================
// GRAFICOS
//===========================================

function dibujarGraficos(){

    dibujarVentasPorTipo();

    dibujarEvolucionDiaria();

}



//===========================================
// VENTAS POR TIPO
//===========================================

function dibujarVentasPorTipo(){

    const canvas =
        document.getElementById(
            "graficoTipos"
        );


    if(!canvas)
        return;



    if(chartTipos){

        chartTipos.destroy();

    }



    const datos = {

        "UP Móvil":0,

        "Migraciones":0,

        "UP Hogar":0

    };



    ventasAsesor.forEach(v=>{


        const tipo =
            (v.tipoVenta || "")
            .toUpperCase();



        const estado =
            (v.estadoCredito || "")
            .toUpperCase()
            .trim();



        if(
            tipo.includes("UP GRADE MOVIL") &&
            estado==="APROBADO"
        ){

            datos["UP Móvil"] +=
                Number(v.diferencia)||0;

        }



        if(
            tipo.includes("MIGRACION") &&
            (
                estado==="APROBADO" ||
                estado==="PENDIENTE BIOMETRIA"
            )
        ){

            datos["Migraciones"]++;

        }



        if(
            tipo.includes("UP GRADE HOGAR") &&
            estado==="APROBADO"
        ){

            datos["UP Hogar"] +=
                Number(v.diferencia)||0;

        }


    });



    chartTipos =
        new Chart(
            canvas,
            {

            type:"bar",

            data:{

                labels:Object.keys(datos),

                datasets:[{

                    label:"Producción",

                    data:Object.values(datos)

                }]

            },

            options:{

                responsive:true,

                scales:{

                    y:{

                        beginAtZero:true

                    }

                }

            }

        });

}



//===========================================
// EVOLUCIÓN DIARIA
//===========================================

function dibujarEvolucionDiaria(){

    const canvas =
        document.getElementById(
            "graficoEvolucion"
        );


    if(!canvas)
        return;



    if(chartEvolucion){

        chartEvolucion.destroy();

    }



    const fechas={};



    ventasAsesor.forEach(v=>{


        const estado =
            (v.estadoCredito || "")
            .toUpperCase()
            .trim();


        const tipo =
            (v.tipoVenta || "")
            .toUpperCase();



        let valido=false;



        if(
            tipo.includes("UP GRADE MOVIL") &&
            estado==="APROBADO"
        )
            valido=true;



        if(
            tipo.includes("UP GRADE HOGAR") &&
            estado==="APROBADO"
        )
            valido=true;



        if(
            tipo.includes("MIGRACION") &&
            (
                estado==="APROBADO" ||
                estado==="PENDIENTE BIOMETRIA"
            )
        )
            valido=true;



        if(!valido)
            return;



        const fecha =
            formatearFecha(
                v.fechaActivacion
            );



        if(!fechas[fecha])
            fechas[fecha]=0;



        fechas[fecha]++;

    });



    const fechasOrdenadas =
        Object.keys(fechas)
        .sort((a,b)=>{

            return new Date(
                a.split("/").reverse().join("-")
            )
            -
            new Date(
                b.split("/").reverse().join("-")
            );

        });



    chartEvolucion =
        new Chart(
            canvas,
            {

            type:"line",

            data:{

                labels:fechasOrdenadas,

                datasets:[{

                    label:"Ventas diarias",

                    data:
                    fechasOrdenadas.map(
                        f=>fechas[f]
                    ),

                    tension:0.3

                }]

            },

            options:{

                responsive:true,

                scales:{

                    y:{

                        beginAtZero:true

                    }

                }

            }

        });


}