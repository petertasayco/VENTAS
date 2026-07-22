/***************************************************
 *
 * RANKING DE COMISIONES
 * PARTE 1
 *
 **************************************************/

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
// CONFIGURACIÓN
//===========================================

const configuracion = {

    "PETER TASAYCO":{

        boton:"btnPeter",
        input:"excelPeter",
        archivo:"archivoPeter"

    },

    "ISABEL PEREYRA":{

        boton:"btnIsabel",
        input:"excelIsabel",
        archivo:"archivoIsabel"

    },

    "JOSE ALVAREZ":{

        boton:"btnJose",
        input:"excelJose",
        archivo:"archivoJose"

    },

    "PEDRO LLAZA":{

        boton:"btnPedro",
        input:"excelPedro",
        archivo:"archivoPedro"

    }

};


//===========================================
// INICIAR
//===========================================

window.addEventListener("load", iniciar);



function iniciar(){

    Object.keys(configuracion).forEach(supervisor=>{

        const info=configuracion[supervisor];

        const boton=document.getElementById(info.boton);

        const input=document.getElementById(info.input);

        boton.onclick=()=>{

            input.click();

        };

        input.addEventListener("change",e=>{

            cargarExcel(e,supervisor);

        });

    });

}



//===========================================
// CARGAR EXCEL
//===========================================

function cargarExcel(evento,supervisor){

    const archivo=evento.target.files[0];

    if(!archivo){

        return;

    }

    const lector=new FileReader();

    lector.onload=function(e){

        const datos=new Uint8Array(e.target.result);

        const libro=XLSX.read(datos,{

            type:"array"

        });

        const hoja=

            libro.Sheets[
                libro.SheetNames[0]
            ];

        const json=

            XLSX.utils.sheet_to_json(

                hoja,

                {

                    defval:""

                }

            );

        datosSupervisores[supervisor]=json;

        actualizarBoton(

            supervisor,

            archivo.name

        );

        procesarDatos();

    };

    lector.readAsArrayBuffer(archivo);

}



//===========================================
// ACTUALIZAR BOTÓN
//===========================================

function actualizarBoton(

    supervisor,

    archivo

){

    const info=configuracion[supervisor];

    document

        .getElementById(info.boton)

        .classList.add(

            "cargado"

        );

    document

        .getElementById(info.archivo)

        .innerHTML=archivo;

    document

        .getElementById(

            "ultimaActualizacion"

        )

        .innerHTML=

        new Date()

        .toLocaleString(

            "es-PE"

        );

}



//===========================================
// FUNCIONES VACÍAS
//===========================================

// Se implementarán en la Parte 2

function procesarDatos(){

}

function actualizarTabla(){

}

/***************************************************
 *
 * PARTE 2
 * PROCESAMIENTO DE DATOS
 *
 **************************************************/

let rankingSupervisores = {};

function procesarDatos(){

    rankingSupervisores={};

    Object.keys(datosSupervisores).forEach(supervisor=>{

        const filas=datosSupervisores[supervisor];

        const asesores={};

        const ordenes=new Set();

        filas.forEach(fila=>{

            //------------------------------------------------
            // SOLO APROBADOS
            //------------------------------------------------

            if(
                String(fila.estadoCredito).trim().toUpperCase()
                !="APROBADO"
            ){
                return;
            }

            //------------------------------------------------
            // SOLO VENTA CONCRETADA
            //------------------------------------------------

            if(
                String(fila.estadoActual).trim().toUpperCase()
                !="VENTA CONCRETADA"
            ){
                return;
            }

            //------------------------------------------------
            // EVITAR DUPLICADOS
            //------------------------------------------------

            const nroOrden=
                String(fila.nroOrden).trim();

            if(
                nroOrden!=""
                &&
                ordenes.has(nroOrden)
            ){
                return;
            }

            if(nroOrden!=""){

                ordenes.add(nroOrden);

            }

            //------------------------------------------------
            // ASESOR
            //------------------------------------------------

            const asesor=
                String(fila["Registrado por"]).trim();

            if(asesor=="") return;

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
            // TIPO PLAN
            //------------------------------------------------

            const tipo=
                String(fila.tipoPlan)
                .toUpperCase();
                const anterior =
parseFloat(fila.tarifaAnterior) || 0;

const nueva =
parseFloat(fila.tarifaNueva) || 0;

const diferencia = nueva - anterior;

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

        const lista=

            Object.values(asesores)

            .sort((a,b)=>{

    // 1. Mayor Upgrade Móvil
    if(b.upMovil !== a.upMovil){
        return b.upMovil - a.upMovil;
    }

    // 2. Si empatan, mayor Migraciones
    if(b.migraciones !== a.migraciones){
        return b.migraciones - a.migraciones;
    }

    // 3. Si empatan, mayor Upgrade Hogar
    return b.upHogar - a.upHogar;

});

        //----------------------------------------------------
        // TOTALES
        //----------------------------------------------------

        let totalMovil=0;

        let totalMigraciones=0;

        let totalHogar=0;

        let totalVentas=0;

        lista.forEach(item=>{

            totalMovil+=item.upMovil;

            totalMigraciones+=item.migraciones;

            totalHogar+=item.upHogar;

            totalVentas+=item.total;

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

    let html="";

    Object.keys(rankingSupervisores).forEach(supervisor=>{

        const grupo=rankingSupervisores[supervisor];

        if(!grupo) return;

        //--------------------------------------
        // CABECERA SUPERVISOR
        //--------------------------------------

        html+=`

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

            let medalla="";

            if(index==0){

                medalla="🥇 ";

            }

            else if(index==1){

                medalla="🥈 ";

            }

            else if(index==2){

                medalla="🥉 ";

            }

            html+=`

            <tr>

                <td style="text-align:left">

                    ${medalla}${asesor.asesor}

                </td>

                <td>

                    ${asesor.upMovil}

                </td>

                <td>

                    ${asesor.migraciones}

                </td>

                <td>

                    ${asesor.upHogar}

                </td>

            </tr>

            `;

        });

        //--------------------------------------
        // TOTAL SUPERVISOR
        //--------------------------------------

        html+=`

        <tr class="totalSupervisor">

            <td colspan="4">

                TOTAL ${supervisor}

                |

                UP MOVIL:
                ${grupo.totalMovil}

                |

                MIGRACIONES:
                ${grupo.totalMigraciones}

                |

                UP HOGAR:
                ${grupo.totalHogar}

                |

                TOTAL:
                ${grupo.totalVentas}

            </td>

        </tr>

        `;

    });

    document.getElementById("data").innerHTML=html;

    dibujarRankingSupervisores();

}



/***************************************************
 *
 * RANKING SUPERVISORES
 *
 **************************************************/

function dibujarRankingSupervisores(){

    const ranking=

        Object.entries(rankingSupervisores)

        .sort((a,b)=>{

            return b[1].totalVentas-a[1].totalVentas;

        });

    console.clear();

    console.log("========= RANKING =========");

    ranking.forEach((item,index)=>{

        console.log(

            (index+1)+".",

            item[0],

            "-",

            item[1].totalVentas,

            "ventas"

        );

    });

}
/***************************************************
 *
 * PARTE 4
 * UTILIDADES
 *
 **************************************************/

//==============================================
// AUTOSCROLL
//==============================================

// function iniciarAutoScroll(){

//     setTimeout(autoScroll,3000);

// }

// function autoScroll(){

//     const duracion=20000;

//     const alturaTotal=

//         document.documentElement.scrollHeight-
//         window.innerHeight;

//     if(alturaTotal<=0){

//         setTimeout(autoScroll,3000);

//         return;

//     }

//     const inicio=Date.now();

//     function animar(){

//         const progreso=Math.min(

//             (Date.now()-inicio)/duracion,

//             1

//         );

//         window.scrollTo(

//             0,

//             alturaTotal*progreso

//         );

//         if(progreso<1){

//             requestAnimationFrame(animar);

//         }

//         else{

//             setTimeout(()=>{

//                 window.scrollTo({

//                     top:0,

//                     behavior:"smooth"

//                 });

//                 setTimeout(

//                     autoScroll,

//                     2500

//                 );

//             },3000);

//         }

//     }

//     animar();

// }



//==============================================
// EFECTO TABLA
//==============================================

function animarTabla(){

    const tabla=document.querySelector("table");

    if(!tabla) return;

    tabla.style.opacity="0";

    tabla.style.transform="scale(.98)";

    setTimeout(()=>{

        tabla.style.transition=".4s";

        tabla.style.opacity="1";

        tabla.style.transform="scale(1)";

    },50);

}



//==============================================
// TARJETAS SUPERIORES
//==============================================

function obtenerTotalesGenerales(){

    let movil=0;

    let migra=0;

    let hogar=0;

    let total=0;

    Object.values(rankingSupervisores)

    .forEach(item=>{

        movil+=item.totalMovil;

        migra+=item.totalMigraciones;

        hogar+=item.totalHogar;

        total+=item.totalVentas;

    });

    console.log("TOTAL GENERAL");

    console.log("UP MOVIL:",movil);

    console.log("MIGRACIONES:",migra);

    console.log("UP HOGAR:",hogar);

    console.log("TOTAL:",total);

}



//==============================================
// CONTADOR ARCHIVOS
//==============================================

function archivosCargados(){

    let total=0;

    Object.keys(datosSupervisores)

    .forEach(s=>{

        if(

            datosSupervisores[s].length>0

        ){

            total++;

        }

    });

    return total;

}



//==============================================
// VALIDAR SI FALTA ALGÚN EXCEL
//==============================================

function validarCarga(){

    const cargados=

        archivosCargados();

    if(cargados<4){

        console.log(

            "Faltan",

            4-cargados,

            "archivos."

        );

    }

    else{

        console.log(

            "Todos los supervisores cargaron su Excel."

        );

    }

}



//==============================================
// ACTUALIZACIÓN AUTOMÁTICA
//==============================================

function actualizarDashboard(){

    animarTabla();

    validarCarga();

    obtenerTotalesGenerales();

}



//==============================================
// MODIFICAR ACTUALIZAR TABLA
//==============================================

const actualizarTablaOriginal=actualizarTabla;

actualizarTabla=function(){

    actualizarTablaOriginal();

    actualizarDashboard();

}



//==============================================
// INICIAR AUTOSCROLL
//==============================================

// window.addEventListener(

//     "load",

//     iniciarAutoScroll

// );