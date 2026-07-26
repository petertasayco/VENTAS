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

let graficoAsesores;
let graficoEvolucion;


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

        obtenerSupervisorURL();

        cargarSupervisor();

        calcularKPIs();

        dibujarRankingEquipo();

        dibujarTablaVentas();

        dibujarGraficos();

        cargarEventos();

    }

    catch(error){

        console.error(
            "Error supervisor:",
            error
        );

        mostrarToast(
            MENSAJES.error,
            "error"
        );

    }

    finally{

        ocultarSpinner();

    }

}



//===========================================
// OBTENER SUPERVISOR URL
//===========================================

function obtenerSupervisorURL(){

    const params =
        new URLSearchParams(
            window.location.search
        );


    supervisorActual =
        decodeURIComponent(
            params.get("id") || ""
        );

}



//===========================================
// CARGAR DATOS
//===========================================

function cargarSupervisor(){

    ventasSupervisor =
        buscarSupervisor(
            supervisorActual
        );


    ventasSupervisorOriginal =
        [...ventasSupervisor];


    rankingEquipo =
        calcularRankingAsesor(
            ventasSupervisor
        );

}



//===========================================
// INFORMACIÓN SUPERIOR
//===========================================

function actualizarInformacion(){

    const nombre =
        document.getElementById(
            "nombreSupervisor"
        );


    if(nombre){

        nombre.textContent =
            supervisorActual || "-";

    }


    const cantidad =
        document.getElementById(
            "kpiAsesores"
        );


    if(cantidad){

        cantidad.textContent =
            rankingEquipo.length;

    }

}



//===========================================
// KPI
//===========================================

function calcularKPIs(){

    actualizarInformacion();


    let upMovil = 0;
    let migraciones = 0;
    let upHogar = 0;


    let upMovilNegados = 0;
    let migracionesNegadas = 0;
    let upHogarNegados = 0;



    ventasSupervisor.forEach(v=>{


        const tipo =
            (v.tipoVenta || "")
            .toLowerCase();


        const estado =
            (v.estadoCredito || "")
            .toUpperCase()
            .trim();


        const diferencia =
            Number(v.diferencia) || 0;



        //===================================
        // APROBADOS
        //===================================

        if(
            estado === "APROBADO" ||
            (
                tipo.includes("migracion") &&
                estado === "PENDIENTE BIOMETRIA"
            )
        ){


            if(tipo.includes("movil")){

                upMovil += diferencia;

            }


            else if(tipo.includes("hogar")){

                upHogar += diferencia;

            }


            else if(tipo.includes("migracion")){

                migraciones++;

            }


        }



        //===================================
        // NEGADOS
        //===================================

        if(estado === "NEGADO"){


            if(tipo.includes("movil")){

                upMovilNegados += diferencia;

            }


            else if(tipo.includes("hogar")){

                upHogarNegados += diferencia;

            }


            else if(tipo.includes("migracion")){

                migracionesNegadas++;

            }


        }


    });



    const elementos = {


        kpiMovil:
            formatearDinero(upMovil),


        kpiMigraciones:
            migraciones,


        kpiHogar:
            formatearDinero(upHogar),



        kpiMovilNegados:
            formatearDinero(upMovilNegados),


        kpiMigracionesNegadas:
            migracionesNegadas,


        kpiHogarNegados:
            formatearDinero(upHogarNegados)


    };



    Object.entries(elementos)
    .forEach(([id,valor])=>{


        const elemento =
            document.getElementById(id);


        if(elemento){

            elemento.textContent = valor;

        }


    });


}


//===========================================
// RANKING EQUIPO
//===========================================

function dibujarRankingEquipo(){


    const tbody =
        document.getElementById(
            "tablaRanking"
        );


    if(!tbody)
        return;


    let html = "";


    rankingEquipo.forEach(
        (asesor,index)=>{


        html += `

        <tr class="${clasePosicion(index+1)}">


            <td>
                ${medalla(index+1)}
            </td>


            <td>

                <a href="asesor.html?id=${encodeURIComponent(asesor.nombre)}">

                    ${asesor.nombre}

                </a>

            </td>


            <td>
                ${formatearDinero(asesor.upMovil)}
            </td>


            <td>
                ${asesor.migraciones}
            </td>


            <td>
                ${formatearDinero(asesor.upHogar)}
            </td>


            <td>
                ${formatearDinero(asesor.total)}
            </td>


        </tr>

        `;


    });


    tbody.innerHTML = html;


}



//===========================================
// TABLA VENTAS
//===========================================

function dibujarTablaVentas(){


    const tbody =
        document.getElementById(
            "tablaVentas"
        );


    if(!tbody)
        return;


    let html="";


    ventasSupervisor.forEach(v=>{


        html += `

        <tr>


            <td>
                ${formatearFecha(v.fechaActivacion)}
            </td>


            <td>
                ${v.asesor || "-"}
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

                    ${v.estadoCredito || "-"}

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

function cargarEventos(){


    document
        .getElementById("btnFiltrar")
        ?.addEventListener(
            "click",
            aplicarFiltros
        );


    document
        .getElementById("btnExcel")
        ?.addEventListener(
            "click",
            exportarExcel
        );


    document
        .getElementById("btnPDF")
        ?.addEventListener(
            "click",
            exportarPDF
        );

}



//===========================================
// FILTRAR
//===========================================

function aplicarFiltros(){


    const datos =
        filtrarVentas(
            ventasSupervisorOriginal
        );


    ventasSupervisor =
        [...datos];


    rankingEquipo =
        calcularRankingAsesor(
            ventasSupervisor
        );


    calcularKPIs();


    dibujarRankingEquipo();


    dibujarTablaVentas();


}



//===========================================
// POSICIONES
//===========================================

function clasePosicion(posicion){

    if(posicion===1)
        return "top1";


    if(posicion===2)
        return "top2";


    if(posicion===3)
        return "top3";


    return "";

}



//===========================================
// MEDALLAS
//===========================================

function medalla(posicion){

    switch(posicion){

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

//===========================================
// GRAFICOS
//===========================================

function dibujarGraficos(){


    dibujarProduccionAsesor();


    dibujarEvolucionDiaria();


}



//===========================================
// PRODUCCION POR ASESOR
//===========================================

function dibujarProduccionAsesor(){


    const canvas =
        document.getElementById("graficoAsesores");


    if(!canvas)
        return;



    const ranking =
        calcularRankingAsesor(
            ventasSupervisor
        );



    if(graficoAsesores){

        graficoAsesores.destroy();

    }



    graficoAsesores = new Chart(
        canvas,
        {

            type:"bar",


            data:{


                labels:
                    ranking.map(
                        x=>x.nombre
                    ),


                datasets:[{


                    label:"UP Móvil",


                    data:
                        ranking.map(
                            x=>x.upMovil
                        )


                }]


            },


            options:{


                responsive:true,


                plugins:{


                    legend:{

                        display:true

                    }


                }

            }


        }

    );


}



//===========================================
// EVOLUCIÓN DIARIA
//===========================================

let graficoEvolucion;


function dibujarEvolucionDiaria(){

    const canvas =
        document.getElementById("graficoEvolucion");


    if(!canvas) return;


    // destruir gráfico anterior
    if(graficoEvolucion){

        graficoEvolucion.destroy();

    }


    const datos = {};


    ventasSupervisor.forEach(v=>{


        const fecha =
            formatearFecha(v.fechaActivacion);


        if(!datos[fecha]){

            datos[fecha] = 0;

        }


        // sumar producción aprobada
        const estado =
            (v.estadoCredito || "")
            .toUpperCase()
            .trim();


        if(
            estado === "APROBADO" ||
            estado === "PENDIENTE BIOMETRIA"
        ){

            datos[fecha] += Number(v.diferencia) || 0;

        }


    });



    // ordenar fechas antigua -> reciente

    const fechasOrdenadas =
        Object.keys(datos)
        .sort((a,b)=>{


            const fechaA =
                new Date(
                    a.split("/").reverse().join("-")
                );


            const fechaB =
                new Date(
                    b.split("/").reverse().join("-")
                );


            return fechaA - fechaB;


        });



    const valores =
        fechasOrdenadas.map(
            fecha => datos[fecha]
        );



    graficoEvolucion =
        new Chart(canvas,{


            type:"line",


            data:{


                labels:fechasOrdenadas,


                datasets:[{


                    label:"Producción diaria",


                    data:valores,


                    tension:0.3,


                    fill:false


                }]


            },


            options:{


                responsive:true,


                plugins:{


                    legend:{


                        display:true


                    }


                },


                scales:{


                    x:{


                        ticks:{


                            autoSkip:false


                        }


                    },


                    y:{


                        beginAtZero:true


                    }


                }


            }


        });


}