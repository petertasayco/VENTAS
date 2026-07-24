/***************************************************
 *
 * RANKING DE COMISIONES
 * PARTE 1
 * CONFIGURACIÓN E INICIO
 *
 **************************************************/

//===========================================
// CONFIGURACIÓN
//===========================================

const API_URL = "https://script.google.com/macros/s/AKfycbyg4sqmobiR7iNmCL5eaGEXsxH8IR78Yhl_ZoiTrNKnto5pvlzoWnRFG24-MlKhPFO29A/exec";

//===========================================
// DATOS
//===========================================

const datosSupervisores = {

    "PETER TASAYCO": [],
    "ISABEL PEREYRA": [],
    "JOSE ALVAREZ": [],
    "PEDRO LLAZA": []

};


//===========================================
// INICIO
//===========================================

window.addEventListener("load", iniciar);


function iniciar(){

    cargarDatosAPI();

}


//===========================================
// CONEXIÓN GOOGLE SHEETS
//===========================================

async function cargarDatosAPI(){

    try{

        const respuesta = await fetch(API_URL);

        if(!respuesta.ok){

            throw new Error(
                "No fue posible obtener los datos."
            );

        }

        const datos = await respuesta.json();

        if(!Array.isArray(datos)){

            throw new Error(
                "La API no devolvió un arreglo válido."
            );

        }

        console.log(
            `Datos recibidos: ${datos.length}`
        );

        separarDatos(datos);

        procesarDatos();

        document.getElementById(
            "ultimaActualizacion"
        ).textContent =
        new Date().toLocaleString("es-PE");

    }
    catch(error){

        console.error(
            "Error cargando datos:",
            error
        );

        document.getElementById(
            "ultimaActualizacion"
        ).textContent =
        "Error al actualizar";

    }

}


//===========================================
// SEPARAR DATOS POR SUPERVISOR
//===========================================

function separarDatos(datos){

    // Limpiar datos anteriores

    Object.keys(datosSupervisores).forEach(supervisor=>{

        datosSupervisores[supervisor]=[];

    });

    datos.forEach(fila=>{

        const archivo = String(
            fila["Archivo Origen"] || ""
        ).toUpperCase();

        if(archivo.includes("PETER")){

            datosSupervisores[
                "PETER TASAYCO"
            ].push(fila);

        }

        else if(archivo.includes("ISABEL")){

            datosSupervisores[
                "ISABEL PEREYRA"
            ].push(fila);

        }

        else if(archivo.includes("JOSE")){

            datosSupervisores[
                "JOSE ALVAREZ"
            ].push(fila);

        }

        else if(archivo.includes("PEDRO")){

            datosSupervisores[
                "PEDRO LLAZA"
            ].push(fila);

        }

    });

}

/***************************************************
 *
 * PARTE 2
 * PROCESAMIENTO DE DATOS
 *
 **************************************************/

let rankingSupervisores = {};

function procesarDatos(fechaSeleccionada = null){

    rankingSupervisores = {};

    Object.keys(datosSupervisores).forEach(supervisor=>{

        const filas = datosSupervisores[supervisor];

        const asesores = {};

        const ordenes = new Set();

        filas.forEach(fila=>{

            //------------------------------------------------
            // SOLO APROBADOS
            //------------------------------------------------

            if(
                String(fila.estadoCredito || "")
                .trim()
                .toUpperCase() !== "APROBADO"
            ){
                return;
            }

            //------------------------------------------------
            // SOLO VENTA CONCRETADA
            //------------------------------------------------

            if(
                String(fila.estadoActual || "")
                .trim()
                .toUpperCase() !== "VENTA CONCRETADA"
            ){
                return;
            }

            //------------------------------------------------
            // FILTRO POR FECHA
            // (se utilizará más adelante)
            //------------------------------------------------

            if(fechaSeleccionada){

                const fechaVenta = String(
                    fila.fechaVenta || ""
                ).substring(0,10);

                if(fechaVenta !== fechaSeleccionada){

                    return;

                }

            }

            //------------------------------------------------
            // EVITAR ÓRDENES DUPLICADAS
            //------------------------------------------------

            const nroOrden = String(
                fila.nroOrden || ""
            ).trim();

            if(
                nroOrden !== "" &&
                ordenes.has(nroOrden)
            ){
                return;
            }

            if(nroOrden !== ""){

                ordenes.add(nroOrden);

            }

            //------------------------------------------------
            // ASESOR
            //------------------------------------------------

            const asesor = String(
                fila["Registrado por"] || ""
            ).trim();

            if(asesor === ""){

                return;

            }

            //------------------------------------------------
            // CREAR ASESOR
            //------------------------------------------------

            if(!asesores[asesor]){

                asesores[asesor]={

                    asesor,

                    upMovil:0,

                    migraciones:0,

                    upHogar:0,

                    total:0

                };

            }

            //------------------------------------------------
            // DIFERENCIA
            //------------------------------------------------

            const tarifaAnterior =
                parseFloat(fila.tarifaAnterior) || 0;

            const tarifaNueva =
                parseFloat(fila.tarifaNueva) || 0;

            const diferencia =
                Math.max(0, tarifaNueva - tarifaAnterior);

            //------------------------------------------------
            // TIPO PLAN
            //------------------------------------------------

            const tipo = String(
                fila.tipoPlan || ""
            ).toUpperCase();

            if(tipo.includes("MOVIL")){

                asesores[asesor].upMovil += diferencia;

            }

            else if(tipo.includes("MIGRA")){

                asesores[asesor].migraciones++;

            }

            else if(tipo.includes("HOGAR")){

                asesores[asesor].upHogar += diferencia;

            }

            asesores[asesor].total++;

        });

        //----------------------------------------------------
        // ORDENAR ASESORES
        //----------------------------------------------------

        const lista = Object.values(asesores).sort((a,b)=>{

            if(b.upMovil !== a.upMovil){

                return b.upMovil - a.upMovil;

            }

            if(b.migraciones !== a.migraciones){

                return b.migraciones - a.migraciones;

            }

            return b.upHogar - a.upHogar;

        });

        //----------------------------------------------------
        // TOTALES
        //----------------------------------------------------

        let totalMovil = 0;
        let totalMigraciones = 0;
        let totalHogar = 0;
        let totalVentas = 0;

        lista.forEach(item=>{

            totalMovil += item.upMovil;
            totalMigraciones += item.migraciones;
            totalHogar += item.upHogar;
            totalVentas += item.total;

        });

        //----------------------------------------------------
        // GUARDAR
        //----------------------------------------------------

        rankingSupervisores[supervisor]={

            asesores:lista,

            totalMovil,

            totalMigraciones,

            totalHogar,

            totalVentas

        };

    });

    actualizarTabla();

}

/***************************************************
 *
 * PARTE 3
 * DIBUJAR TABLA
 *
 **************************************************/

function actualizarTabla(){

    let html = "";

    Object.keys(rankingSupervisores).forEach(supervisor=>{

        const grupo = rankingSupervisores[supervisor];

        if(!grupo) return;

        //--------------------------------------
        // CABECERA SUPERVISOR
        //--------------------------------------

        html += `

        <tr class="supervisor">

            <td colspan="4">

                👨‍💼 ${supervisor}

            </td>

        </tr>

        `;

        //--------------------------------------
        // ASESORES
        //--------------------------------------

        grupo.asesores.forEach((asesor,index)=>{

            let medalla = "";

            switch(index){

                case 0:
                    medalla = "🥇 ";
                    break;

                case 1:
                    medalla = "🥈 ";
                    break;

                case 2:
                    medalla = "🥉 ";
                    break;

            }

            html += `

            <tr>

                <td style="text-align:left">

                    ${medalla}${asesor.asesor}

                </td>

                <td>

                    ${asesor.upMovil.toFixed(2)}

                </td>

                <td>

                    ${asesor.migraciones}

                </td>

                <td>

                    ${asesor.upHogar.toFixed(2)}

                </td>

            </tr>

            `;

        });

        //--------------------------------------
        // TOTAL SUPERVISOR
        //--------------------------------------

        html += `

        <tr class="totalSupervisor">

            <td colspan="4">

                TOTAL ${supervisor}

                |

                UP MOVIL:
                ${grupo.totalMovil.toFixed(2)}

                |

                MIGRACIONES:
                ${grupo.totalMigraciones}

                |

                UP HOGAR:
                ${grupo.totalHogar.toFixed(2)}

                |

                TOTAL:
                ${grupo.totalVentas}

            </td>

        </tr>

        `;

    });

    document.getElementById("data").innerHTML = html;

    dibujarRankingSupervisores();

}

/***************************************************
 *
 * PARTE 4
 * UTILIDADES
 *
 **************************************************/

//==============================================
// AUTOSCROLL (Opcional)
//==============================================

// function iniciarAutoScroll(){
//     setTimeout(autoScroll,3000);
// }

// function autoScroll(){
//     ...
// }


//==============================================
// EFECTO TABLA
//==============================================

function animarTabla(){

    const tabla = document.querySelector("table");

    if(!tabla) return;

    tabla.style.transition = "none";
    tabla.style.opacity = "0";
    tabla.style.transform = "scale(.98)";

    requestAnimationFrame(()=>{

        tabla.style.transition =
            "opacity .4s ease, transform .4s ease";

        tabla.style.opacity = "1";
        tabla.style.transform = "scale(1)";

    });

}


//==============================================
// TOTALES GENERALES
//==============================================

function obtenerTotalesGenerales(){

    let movil = 0;
    let migra = 0;
    let hogar = 0;
    let total = 0;

    Object.values(rankingSupervisores).forEach(item=>{

        movil += item.totalMovil;
        migra += item.totalMigraciones;
        hogar += item.totalHogar;
        total += item.totalVentas;

    });

    console.log("========== TOTAL GENERAL ==========");
    console.log("UP MOVIL:", movil.toFixed(2));
    console.log("MIGRACIONES:", migra);
    console.log("UP HOGAR:", hogar.toFixed(2));
    console.log("TOTAL VENTAS:", total);

    return{

        movil,
        migra,
        hogar,
        total

    };

}


//==============================================
// ACTUALIZAR DASHBOARD
//==============================================

function actualizarDashboard(){

    animarTabla();

    obtenerTotalesGenerales();

}


//==============================================
// EXTENDER ACTUALIZAR TABLA
//==============================================

const actualizarTablaOriginal = actualizarTabla;

actualizarTabla = function(){

    actualizarTablaOriginal();

    actualizarDashboard();

};