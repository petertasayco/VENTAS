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

let graficoAsesores = null;

let graficoEvolucion = null;


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

        obtenerSupervisorURL();

        cargarSupervisor();

        cargarAsesoresSupervisor();

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


    ventasSupervisor.forEach(v => {


        /*
         * =======================================
         * REGLA CENTRAL
         * =======================================
         *
         * APROBADO                  → CUENTA
         * PENDIENTE BIOMETRIA      → CUENTA
         * NEGADO + COMPLETADO      → CUENTA
         * CANCELADO                 → NO CUENTA
         * NEGADO sin COMPLETADO     → NO CUENTA
         *
         */

        if(!esVentaValida(v)){

            return;

        }


        const tipo =
            String(v.tipoVenta || "")
                .trim()
                .toUpperCase();


        const diferencia =
            Number(v.diferencia) || 0;


        //-----------------------------------
        // UP MOVIL
        //-----------------------------------

        if(tipo === "UP GRADE MOVIL"){

            upMovil += diferencia;

        }


        //-----------------------------------
        // UP HOGAR
        //-----------------------------------

        else if(tipo === "UP GRADE HOGAR"){

            upHogar += diferencia;

        }


        //-----------------------------------
        // MIGRACIONES
        //-----------------------------------

        else if(
            tipo === "MIGRACION" ||
            tipo === "MIGRACIONES"
        ){

            migraciones++;

        }

    });


    /*
     * =======================================
     * NEGADOS
     * =======================================
     *
     * Estos contadores son solamente
     * informativos.
     *
     * NEGADO + COMPLETADO ya es una venta
     * válida y por lo tanto NO debe aparecer
     * como una venta negada pendiente.
     *
     */


    ventasSupervisor.forEach(v => {


        const estado =
            String(v.estadoCredito || "")
                .trim()
                .toUpperCase();


        const estadoGlobal =
            String(
                v["Estado Global"] ||
                v.estadoGlobal ||
                ""
            )
            .trim()
            .toUpperCase();


        /*
         * Solo mostramos como "negado"
         * los NEGADOS que NO están completados.
         */

        if(
            estado !== "NEGADO" ||
            estadoGlobal === "COMPLETADO"
        ){

            return;

        }


        const tipo =
            String(v.tipoVenta || "")
                .trim()
                .toUpperCase();


        const diferencia =
            Number(v.diferencia) || 0;


        if(
            tipo === "UP GRADE MOVIL"
        ){

            upMovilNegados += diferencia;

        }


        else if(
            tipo === "UP GRADE HOGAR"
        ){

            upHogarNegados += diferencia;

        }


        else if(
            tipo === "MIGRACION" ||
            tipo === "MIGRACIONES"
        ){

            migracionesNegadas++;

        }

    });


    const elementos = {


        kpiMovil:
            formatearDinero(
                upMovil
            ),


        kpiMigraciones:
            migraciones,


        kpiHogar:
            formatearDinero(
                upHogar
            ),


        kpiMovilNegados:
            formatearDinero(
                upMovilNegados
            ),


        kpiMigracionesNegadas:
            migracionesNegadas,


        kpiHogarNegados:
            formatearDinero(
                upHogarNegados
            )

    };


    Object.entries(elementos)
        .forEach(([id,valor]) => {

            const elemento =
                document.getElementById(id);


            if(elemento){

                elemento.textContent =
                    valor;

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
        (asesor,index) => {


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


    tbody.innerHTML =
        html;


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


    let html = "";


    /*
     * MOSTRAR SOLO VENTAS VÁLIDAS
     */

    ventasSupervisor
        .filter(v => esVentaValida(v))
        .forEach(v => {


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


    tbody.innerHTML =
        html;


    if(!html){

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;"
                >

                    ${MENSAJES.sinDatos}

                </td>

            </tr>

        `;

    }

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

    dibujarGraficos();

}


//===========================================
// POSICIONES
//===========================================

function clasePosicion(posicion){

    if(posicion === 1)
        return "top1";


    if(posicion === 2)
        return "top2";


    if(posicion === 3)
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
        document.getElementById(
            "graficoAsesores"
        );


    if(!canvas)
        return;


    const ranking =
        calcularRankingAsesor(
            ventasSupervisor
        );


    if(graficoAsesores){

        graficoAsesores.destroy();

    }


    graficoAsesores =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        ranking.map(
                            x => x.nombre
                        ),

                    datasets: [

                        {

                            label:
                                "UP Móvil",

                            data:
                                ranking.map(
                                    x => x.upMovil
                                )

                        },

                        {

                            label:
                                "Migraciones",

                            data:
                                ranking.map(
                                    x => x.migraciones
                                )

                        },

                        {

                            label:
                                "UP Hogar",

                            data:
                                ranking.map(
                                    x => x.upHogar
                                )

                        }

                    ]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {

                            display: true

                        }

                    }

                }

            }

        );

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


    if(graficoEvolucion){

        graficoEvolucion.destroy();

    }


    const datos = {};


    /*
     * SOLO VENTAS VÁLIDAS
     */

    ventasSupervisor.forEach(v => {


        if(!esVentaValida(v)){

            return;

        }


        const fecha =
            formatearFecha(
                v.fechaActivacion
            );


        if(!fecha){

            return;

        }


        const tipo =
            String(v.tipoVenta || "")
                .trim()
                .toUpperCase();


        /*
         * Para la evolución contamos ventas,
         * independientemente de si son:
         *
         * UP Móvil
         * UP Hogar
         * Migraciones
         *
         */

        if(!datos[fecha]){

            datos[fecha] = 0;

        }


        datos[fecha]++;

    });


    //=======================================
    // ORDENAR FECHAS
    //=======================================

    const fechasOrdenadas =
        Object.keys(datos)
            .sort((a,b) => {

                const partesA =
                    a.split("/");

                const partesB =
                    b.split("/");


                const fechaA =
                    new Date(
                        partesA[2],
                        partesA[1] - 1,
                        partesA[0]
                    );


                const fechaB =
                    new Date(
                        partesB[2],
                        partesB[1] - 1,
                        partesB[0]
                    );


                return fechaA - fechaB;

            });


    const valores =
        fechasOrdenadas.map(
            fecha => datos[fecha]
        );


    graficoEvolucion =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels:
                        fechasOrdenadas,

                    datasets: [

                        {

                            label:
                                "Ventas diarias",

                            data:
                                valores,

                            tension:
                                0.3,

                            fill:
                                false

                        }

                    ]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {

                            display: true

                        }

                    },

                    scales: {

                        x: {

                            ticks: {

                                autoSkip: false

                            }

                        },

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }

        );

}


//===========================================
// CARGAR ASESORES
//===========================================

function cargarAsesoresSupervisor(){

    const select =
        document.getElementById(
            "asesor"
        );


    if(!select)
        return;


    select.innerHTML =
    `
        <option value="">
            Todos
        </option>
    `;


    const lista =
        [
            ...new Set(

                ventasSupervisorOriginal
                    .map(v => v.asesor)
                    .filter(Boolean)

            )
        ];


    lista.sort();


    lista.forEach(nombre => {

        select.innerHTML +=
        `
            <option value="${nombre}">
                ${nombre}
            </option>
        `;

    });

}