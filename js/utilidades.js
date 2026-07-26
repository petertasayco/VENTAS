/***************************************************
 *
 * UTILIDADES.JS
 * Funciones reutilizables del proyecto
 *
 ***************************************************/


//===========================================
// FORMATEAR DINERO
//===========================================

function formatearDinero(valor) {

    valor = Number(valor) || 0;

    return valor.toLocaleString(APP.idioma, {

        style: "currency",

        currency: APP.moneda,

        minimumFractionDigits: 2

    });

}


//===========================================
// FORMATEAR NÚMERO
//===========================================

function formatearNumero(valor) {

    return Number(valor || 0)
        .toLocaleString(APP.idioma);

}


//===========================================
// CONVERTIR NÚMERO
//===========================================

function convertirNumero(valor) {

    if (valor == null || valor === "") {
        return 0;
    }

    return Number(
        String(valor).replace(",", ".")
    ) || 0;

}


//===========================================
// FORMATEAR FECHA
//===========================================

function formatearFecha(fecha) {

    if (!fecha) return "-";

    const f = new Date(fecha);

    if (isNaN(f)) return "-";

    return f.toLocaleDateString(FECHA.locale, {

        day: "2-digit",

        month: "2-digit",

        year: "numeric"

    });

}


//===========================================
// FORMATEAR FECHA Y HORA
//===========================================

function formatearFechaHora(fecha) {

    if (!fecha) return "-";

    const f = new Date(fecha);

    if (isNaN(f)) return "-";

    return f.toLocaleString(FECHA.locale, {

        dateStyle: "short",

        timeStyle: "short"

    });

}


//===========================================
// LLENAR SELECT
//===========================================

function llenarSelect(id, datos = []) {

    const select = document.getElementById(id);

    if (!select) return;

    let html = `<option value="">Todos</option>`;

    datos.forEach(item => {

        html += `<option value="${item}">${item}</option>`;

    });

    select.innerHTML = html;

}


//===========================================
// SPINNER
//===========================================

function mostrarSpinner() {

    document
        .getElementById("spinner")
        ?.classList.remove("oculto");

}

function ocultarSpinner() {

    document
        .getElementById("spinner")
        ?.classList.add("oculto");

}


//===========================================
// TOAST
//===========================================

function mostrarToast(mensaje, tipo = "success") {

    document
        .querySelectorAll(".toast")
        .forEach(t => t.remove());

    const toast = document.createElement("div");

    toast.className = `toast toast-${tipo}`;

    toast.textContent = mensaje;

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);

}


//===========================================
// ESTADO CRÉDITO
//===========================================

function obtenerClaseEstado(estado) {

    if (!estado) return "";

    switch (estado.toUpperCase()) {

        case ESTADOS.APROBADO.toUpperCase():
            return "estado-aprobado";

        case ESTADOS.NEGADO.toUpperCase():
            return "estado-negado";

        case ESTADOS.PENDIENTE.toUpperCase():
            return "estado-pendiente";

        default:
            return "";

    }

}


//===========================================
// CAPITALIZAR
//===========================================

function capitalizar(texto) {

    if (!texto) return "";

    return texto
        .toLocaleLowerCase(APP.idioma)
        .replace(/\p{L}/gu, (l, i, s) =>
            i === 0 || s[i - 1] === " "
                ? l.toLocaleUpperCase(APP.idioma)
                : l
        );

}


//===========================================
// DEBOUNCE
//===========================================

function debounce(funcion, tiempo = 300) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            funcion(...args);

        }, tiempo);

    };

}


//===========================================
// ORDENAR ARRAY
//===========================================

function ordenarPor(lista, campo, descendente = true) {

    return [...lista].sort((a, b) => {

        const A = a[campo];

        const B = b[campo];

        if (typeof A === "number" && typeof B === "number") {

            return descendente
                ? B - A
                : A - B;

        }

        return descendente
            ? String(B).localeCompare(String(A))
            : String(A).localeCompare(String(B));

    });

}


//===========================================
// COPIAR TEXTO
//===========================================

async function copiarTexto(texto) {

    try {

        await navigator.clipboard.writeText(texto);

        mostrarToast("Copiado correctamente");

    } catch {

        mostrarToast("No se pudo copiar", "error");

    }

}


//===========================================
// DESCARGAR ARCHIVO
//===========================================

function descargarArchivo(contenido, nombre) {

    const blob = new Blob([contenido], {

        type: "text/plain"

    });

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");

    enlace.href = url;

    enlace.download = nombre;

    document.body.appendChild(enlace);

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(url);

}