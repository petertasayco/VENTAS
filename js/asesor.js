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


    const nombreAsesor =
        document.getElementById(
            "nombreAsesor"
        );


    if(nombreAsesor){

        nombreAsesor.textContent =
            asesor;

    }


    const supervisor =
        document.getElementById(
            "supervisor"
        );


    if(supervisor){

        supervisor.textContent =
            venta.supervisor || "-";

    }


    const nombreSupervisor =
        document.getElementById(
            "nombreSupervisor"
        );


    if(nombreSupervisor){

        nombreSupervisor.textContent =
            `Supervisor: ${venta.supervisor || "-"}`;

    }

}


//===========================================
// KPIs
//===========================================

function dibujarKPIs(){

    /*
     * Los KPIs utilizan obtenerKPIs()
     *
     * obtenerKPIs() utiliza esVentaValida()
     *
     * Por lo tanto:
     *
     * APROBADO              → CUENTA
     * PENDIENTE BIOMETRIA   → CUENTA
     * NEGADO + COMPLETADA   → CUENTA
     * CANCELADA             → NO CUENTA
     */


    const kpi =
        obtenerKPIs(
            ventasAsesor
        );


    const kpiMovil =
        document.getElementById(
            "kpiMovil"
        );


    if(kpiMovil){

        kpiMovil.textContent =
            formatearDinero(
                kpi.upMovil
            );

    }


    const kpiHogar =
        document.getElementById(
            "kpiHogar"
        );


    if(kpiHogar){

        kpiHogar.textContent =
            formatearDinero(
                kpi.upHogar
            );

    }


    const kpiMigraciones =
        document.getElementById(
            "kpiMigraciones"
        );


    if(kpiMigraciones){

        kpiMigraciones.textContent =
            kpi.migraciones;

    }


    const kpiVentas =
        document.getElementById(
            "kpiVentas"
        );


    if(kpiVentas){

        kpiVentas.textContent =
            kpi.ventas;

    }


    const comision =
        document.getElementById(
            "kpiComision"
        );


    if(comision){

        comision.textContent =
            formatearDinero(
                kpi.total
            );

    }

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

    let html = "";

    ventasAsesor.forEach(v => {

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

                    ${v.estadoCredito || "-"}

                </span>

            </td>

        </tr>

        `;

    });

    tbody.innerHTML = html;

    if(!html){

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
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

}


//===========================================
// FILTROS
//===========================================

//===========================================
// FILTROS
//===========================================

//===========================================
// FILTROS
//===========================================

function aplicarFiltros(){

    console.log("========== APLICANDO FILTROS ==========");


    //===========================================
    // PARTIR DE LOS DATOS ORIGINALES
    //===========================================

    ventasAsesor = [...ventasOriginales];


    console.log(
        "Ventas originales:",
        ventasAsesor.length
    );


    //===========================================
    // OBTENER FILTROS
    //===========================================

    const inicio =
        obtenerValor("fechaInicio");

    const fin =
        obtenerValor("fechaFin");

    const tipo =
        obtenerValor("tipoVenta");

    const estadoCredito =
        obtenerValor("estadoCredito");

    const estadoGlobal =
        obtenerValor("estadoGlobal");


    console.log("Fecha inicio:", inicio);
    console.log("Fecha fin:", fin);
    console.log("Tipo:", tipo);
    console.log("Estado crédito:", estadoCredito);
    console.log("Estado global:", estadoGlobal);


    //===========================================
    // FECHA INICIO
    //===========================================

    if(inicio){

        ventasAsesor =
            filtrarPorFechaInicio(
                ventasAsesor,
                inicio
            );

    }


    //===========================================
    // FECHA FIN
    //===========================================

    if(fin){

        ventasAsesor =
            filtrarPorFechaFin(
                ventasAsesor,
                fin
            );

    }


    //===========================================
    // TIPO DE VENTA
    //===========================================

    if(tipo){

        ventasAsesor =
            filtrarPorTipoVenta(
                ventasAsesor,
                tipo
            );

    }


    //===========================================
    // ESTADO CRÉDITO
    //===========================================

    if(estadoCredito){

        ventasAsesor =
            filtrarPorEstado(
                ventasAsesor,
                estadoCredito
            );

    }


    //===========================================
    // ESTADO GLOBAL
    //===========================================

    if(estadoGlobal){

        ventasAsesor =
            filtrarPorEstadoGlobal(
                ventasAsesor,
                estadoGlobal
            );

    }


    //===========================================
    // MOSTRAR RESULTADO
    //===========================================

    console.log(
        "Ventas después de filtros:",
        ventasAsesor.length
    );


    // Mostrar algunos estados para comprobar
    console.log(
        "Estados globales encontrados:",
        [...new Set(
            ventasAsesor.map(v => v.estadoGlobal)
        )]
    );


    actualizarVista();

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

        "UP Móvil": 0,

        "Migraciones": 0,

        "UP Hogar": 0

    };


    /*
     * Los gráficos solamente muestran
     * ventas que cuentan para producción.
     *
     * Las CANCELADAS no participan.
     */


    ventasAsesor.forEach(v => {


        if(!esVentaValida(v)){

            return;

        }


        const tipo =
            String(
                v.tipoVenta || ""
            )
            .trim()
            .toUpperCase();


        const diferencia =
            Number(
                v.diferencia
            ) || 0;


        //===================================
        // UP MOVIL
        //===================================

        if(
            tipo === "UP GRADE MOVIL"
        ){

            datos["UP Móvil"] +=
                diferencia;

        }


        //===================================
        // MIGRACIONES
        //===================================

        else if(
            tipo === "MIGRACION" ||
            tipo === "MIGRACIONES"
        ){

            datos["Migraciones"]++;

        }


        //===================================
        // UP HOGAR
        //===================================

        else if(
            tipo === "UP GRADE HOGAR"
        ){

            datos["UP Hogar"] +=
                diferencia;

        }

    });


    chartTipos =
        new Chart(
            canvas,
            {

                type: "bar",


                data: {

                    labels:
                        Object.keys(datos),


                    datasets: [{

                        label:
                            "Producción",


                        data:
                            Object.values(datos)

                    }]

                },


                options: {

                    responsive: true,


                    scales: {

                        y: {

                            beginAtZero: true

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


    if(chartEvolucion){

        chartEvolucion.destroy();

    }


    const fechas = {};


    /*
     * SOLO VENTAS VÁLIDAS
     *
     * Las canceladas no aparecen
     * en la evolución.
     */


    ventasAsesor.forEach(v => {


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


        if(!fechas[fecha]){

            fechas[fecha] = 0;

        }


        fechas[fecha]++;

    });


    const fechasOrdenadas =

        Object.keys(fechas)

            .sort((a,b) => {


                const [diaA, mesA, anioA] =
                    a.split("/");


                const [diaB, mesB, anioB] =
                    b.split("/");


                const fechaA =
                    new Date(
                        anioA,
                        mesA - 1,
                        diaA
                    );


                const fechaB =
                    new Date(
                        anioB,
                        mesB - 1,
                        diaB
                    );


                return fechaA - fechaB;

            });


    chartEvolucion =
        new Chart(
            canvas,
            {

                type: "line",


                data: {

                    labels:
                        fechasOrdenadas,


                    datasets: [{

                        label:
                            "Ventas diarias",


                        data:
                            fechasOrdenadas.map(
                                f => fechas[f]
                            ),


                        tension: 0.3

                    }]

                },


                options: {

                    responsive: true,


                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }
        );

}