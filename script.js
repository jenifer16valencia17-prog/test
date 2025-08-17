window.addEventListener("scroll", function () {
    const headerFull = document.querySelector(".header_full_height");
    const headerShrinked = document.querySelector(".header_shrinked");

    if (window.scrollY > 80) {
        headerFull.style.opacity = "0";
        headerShrinked.style.opacity = "1";
    } else {
        headerFull.style.opacity = "1";
        headerShrinked.style.opacity = "0";
    }
});

//Flashcards

// Selecciona todas las tarjetas
const flashcards = document.querySelectorAll(".flashcard");

// Agrega un evento de clic/toque a cada tarjeta
flashcards.forEach((card) => {
    card.addEventListener("click", () => {
        // Alterna una clase activa para rotar la tarjeta
        card.classList.toggle("is-flipped");
    });
});

// Scroll to calculator section
function scrollToCalculator() {
    const calculatorSection = document.getElementById("calculator");
    calculatorSection.scrollIntoView({ behavior: "smooth" });
}

// Función genérica para cargar datos desde un archivo CSV y generar gráficas
function cargarDatos(rutaCSV, tipoGrafica, canvasId, opciones) {
    fetch(rutaCSV)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar el archivo CSV: ${rutaCSV}`);
            }
            return response.text();
        })
        .then((contenido) => {
            const { etiquetas, datos } = procesarCSV(contenido);
            generarGrafica(canvasId, etiquetas, datos, tipoGrafica, opciones);
        })
        .catch((error) => console.error("Error al cargar el CSV:", error));
}

// Procesar el contenido de un archivo CSV
function procesarCSV(contenido) {
    const lineas = contenido.split("\n").map((linea) => linea.trim());
    const etiquetas = [];
    const datos = [];

    lineas.forEach((linea, index) => {
        if (linea) {
            const [etiqueta, valor] = linea.split(",");
            if (index === 0 && isNaN(Number(valor))) {
                // Omite encabezados si existen
                return;
            }
            etiquetas.push(etiqueta);
            datos.push(Number(valor));
        }
    });

    return { etiquetas, datos };
}

// Función para generar una gráfica con Chart.js
function generarGrafica(canvasId, etiquetas, datos, tipoGrafica, opciones) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
        type: tipoGrafica,
        data: {
            labels: etiquetas,
            datasets: [
                {
                    label: opciones.label || "Datos",
                    data: datos,
                    backgroundColor: opciones.backgroundColor || [
                        "#3B82F6",
                        "#EF4444",
                        "#10B981",
                        "#FBBF24",
                        "#8B5CF6",
                    ],
                    borderColor: opciones.borderColor || "#FFFFFF",
                    borderWidth: opciones.borderWidth || 2,
                    fill: opciones.fill || false,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: opciones.showLegend || true,
                    position: opciones.legendPosition || "top",
                    labels: {
                        color: opciones.legendColor || "#FFFFFF",
                    },
                },
            },
            scales: opciones.scales || {},
        },
    });
}

// Función para cargar datos desde un archivo CSV y generar una gráfica de área
function cargarDatosGraficaArea(rutaArchivo, idCanvas) {
    fetch(rutaArchivo)
        .then((respuesta) => {
            if (!respuesta.ok) {
                throw new Error(`No se pudo cargar el archivo CSV: ${rutaArchivo}`);
            }
            return respuesta.text();
        })
        .then((contenidoArchivo) => {
            const { categorias, datosPorCategoria } =
                procesarArchivoArea(contenidoArchivo);
            generarGraficaAreaPersonalizada(idCanvas, categorias, datosPorCategoria);
        })
        .catch((error) =>
            console.error("Error al cargar el CSV para gráfica de área:", error)
        );
}

// Procesar el contenido del archivo CSV para gráfica de área
function procesarArchivoArea(contenidoArchivo) {
    const lineasArchivo = contenidoArchivo
        .split("\n")
        .map((linea) => linea.trim());
    const categorias = [];
    const valoresPorFuente = {};

    lineasArchivo.forEach((linea, indice) => {
        const valoresLinea = linea.split(",");
        if (indice === 0) {
            // Primera línea: encabezados (nombres de las fuentes)
            valoresLinea.slice(1).forEach((fuente) => {
                valoresPorFuente[fuente] = [];
            });
        } else {
            // Resto de líneas: datos
            categorias.push(valoresLinea[0]); // Primera columna: años
            valoresLinea.slice(1).forEach((valor, i) => {
                const fuenteActual = Object.keys(valoresPorFuente)[i];
                valoresPorFuente[fuenteActual].push(Number(valor));
            });
        }
    });

    return { categorias, datosPorCategoria: valoresPorFuente };
}

// Función para generar la gráfica de área con varias líneas
function generarGraficaAreaPersonalizada(
    idCanvas,
    categorias,
    datosPorCategoria
) {
    const paletaColores = [
        { relleno: "rgba(59, 130, 246, 0.2)", borde: "rgba(59, 130, 246, 1)" }, // Azul
        { relleno: "rgba(239, 68, 68, 0.2)", borde: "rgba(239, 68, 68, 1)" }, // Rojo
        { relleno: "rgba(16, 185, 129, 0.2)", borde: "rgba(16, 185, 129, 1)" }, // Verde
        { relleno: "rgba(251, 191, 36, 0.2)", borde: "rgba(251, 191, 36, 1)" }, // Amarillo
        { relleno: "rgba(139, 92, 246, 0.2)", borde: "rgba(139, 92, 246, 1)" }, // Morado
    ];

    const conjuntosDatos = Object.keys(datosPorCategoria).map(
        (fuente, indice) => ({
            label: fuente,
            data: datosPorCategoria[fuente],
            backgroundColor: paletaColores[indice % paletaColores.length].relleno,
            borderColor: paletaColores[indice % paletaColores.length].borde,
            borderWidth: 2,
            fill: true,
        })
    );

    const contexto = document.getElementById(idCanvas).getContext("2d");
    new Chart(contexto, {
        type: "line",
        data: {
            labels: categorias,
            datasets: conjuntosDatos,
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        color: "#FFFFFF",
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: "#FFFFFF" },
                    grid: { color: "#444444" },
                },
                x: {
                    ticks: { color: "#FFFFFF" },
                    grid: { color: "#444444" },
                },
            },
        },
    });
}

// Registrar todas las funciones usando addEventListener
document.addEventListener("DOMContentLoaded", function () {
    // Gráfica Doughnut
    cargarDatos("participacion_2022.csv", "doughnut", "doughnut_chart_render", {
        label: "Participación en 2022",
        backgroundColor: ["#3B82F6", "#EF4444", "#10B981", "#FBBF24", "#8B5CF6"],
    });

    // Gráfica de Barras
    cargarDatos("produccion_2022.csv", "bar", "bar_chart_render", {
        label: "Producción por Fuente en 2022",
        backgroundColor: "#FFD700",
        borderColor: "#333333",
        borderWidth: 1,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: "#FFFFFF" },
                grid: { color: "#444444" },
            },
            x: {
                ticks: { color: "#FFFFFF" },
                grid: { color: "#444444" },
            },
        },
    });

    // Gráfica de Línea
    cargarDatos("evolucion_historica.csv", "line", "line_chart_render", {
        label: "Evolución Histórica",
        borderColor: "#3B82F6",
        fill: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: "#FFFFFF" },
                grid: { color: "#444444" },
            },
            x: {
                ticks: { color: "#FFFFFF" },
                grid: { color: "#444444" },
            },
        },
    });

    // Gráfica de Área
    cargarDatosGraficaArea("produccion_acumulada.csv", "area_chart_render");
});




document
    .getElementById("energyForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        const watts = parseFloat(document.getElementById("watts").value);
        const resultDiv = document.getElementById("result");

        if (isNaN(watts) || watts <= 0) {
            resultDiv.textContent = "Por favor, ingrese un número válido de vatios.";
            return;
        }

        // Factores de conversión (valores aproximados)
        const solarEquivalent = (watts / 400).toFixed(2); // 1 panel solar genera 400 W
        const windEquivalent = (watts / 2000).toFixed(2); // 1 turbina eólica pequeña genera 2000 W
        const hydroEquivalent = (watts / 10000).toFixed(2); // Microcentral hidroeléctrica genera 10,000 W
        const biofuelEquivalent = (watts / 30).toFixed(2); // 1 litro de biocombustible produce 30 W (aproximado)
        const geothermalEquivalent = (watts / 5000).toFixed(2); // Una planta geotérmica pequeña genera 5000 W

        resultDiv.innerHTML = `
    <p>Con un consumo de <strong>${watts} W</strong>, equivale a:</p>
    <ul>
        <li><strong>${solarEquivalent}</strong> paneles solares (400 W/panel)</li>
        <li><strong>${windEquivalent}</strong> turbinas eólicas pequeñas (2000 W/turbina)</li>
        <li><strong>${hydroEquivalent}</strong> microcentrales hidroeléctricas (10,000 W/microcentral)</li>
        <li><strong>${biofuelEquivalent}</strong> litros de biocombustible (30 W/litro)</li>
        <li><strong>${geothermalEquivalent}</strong> plantas geotérmicas pequeñas (5000 W/planta)</li>
    </ul>
    `;
    });
