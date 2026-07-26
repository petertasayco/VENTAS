const API_URL = "https://script.google.com/macros/s/AKfycbyg4sqmobiR7iNmCL5eaGEXsxH8IR78Yhl_ZoiTrNKnto5pvlzoWnRFG24-MlKhPFO29A/exec";


const APP = {

    nombre: "Ranking de Comisiones",

    version: "1.0.0",

    autoActualizar: 60000,

    idioma: "es-PE",

    moneda: "PEN"

};



const TIPOS_VENTA = {

    MOVIL: "Up grade movil",

    HOGAR: "Up grade hogar",

    MIGRACION: "Migraciones"

};



const ESTADOS = {

    APROBADO: "Aprobado",

    NEGADO: "Negado",

    PENDIENTE: "Pendiente"

};



const CAMPOS = {

    asesor: "asesor",

    supervisor: "supervisor",

    venta: "tipoVenta",

    monto: "diferencia",

    estado: "estadoCredito",

    fecha: "fechaActivacion"

};



const PAGINACION = {

    filasPorPagina: 10

};



const FECHA = {

    locale: "es-PE"

};



const MENSAJES = {

    cargando: "Cargando información...",

    sinDatos: "No existen datos para mostrar.",

    error: "Ocurrió un error al cargar la información.",

    guardado: "Cambios guardados correctamente."

};