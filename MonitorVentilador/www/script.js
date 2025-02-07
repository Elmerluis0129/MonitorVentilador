// Generar hora actual
function generateTime() {
  const now = new Date();
  return now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

// Agregar una nueva entrada a la tabla
function addLogEntry(state) {
  const tbody = document.getElementById("fan-log");
  const newRow = document.createElement("tr");

  const encendidoCell = document.createElement("td");
  const apagadoCell = document.createElement("td");
  const estadoCell = document.createElement("td");

  if (state === "Encendido") {
    encendidoCell.textContent = generateTime();
    apagadoCell.textContent = "";
    estadoCell.textContent = state;
    estadoCell.className = "encendido";
  } else {
    encendidoCell.textContent = "";
    apagadoCell.textContent = generateTime();
    estadoCell.textContent = state;
    estadoCell.className = "apagado";
  }

  newRow.appendChild(encendidoCell);
  newRow.appendChild(apagadoCell);
  newRow.appendChild(estadoCell);
  tbody.appendChild(newRow);
}

// Descargar registros en formato CSV
function downloadCSV() {
  let csvContent = "data:text/csv;charset=utf-8,Hora de Encendido,Hora de Apagado,Estado\n";

  // Obtener todas las filas de la tabla
  const rows = document.querySelectorAll("#fan-log tr");
  rows.forEach(row => {
    const cols = row.querySelectorAll("td");
    const rowData = Array.from(cols).map(col => col.textContent).join(",");
    csvContent += rowData + "\n";
  });

  // Crear un enlace de descarga
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "registros_ventilador.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Verificar constantemente el estado del ventilador en ThingSpeak
let lastState = null; // Estado previo para detectar cambios

async function fetchData() {
  const url =
    "https://api.thingspeak.com/channels/2830978/fields/1/last.json?api_key=D47ZG0BY8RZ7R823"; // Reemplaza con tu API Key

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Leer el estado actual del ventilador desde la API
    if (data && data.field1 !== undefined) {
      const field1 = data.field1;
      const currentState = field1 === "1" ? "Encendido" : "Apagado";

      console.log("Estado recibido:", currentState);

      // Registrar solo si hay un cambio en el estado
      if (currentState !== lastState || lastState === null) {
        addLogEntry(currentState); // Registrar el cambio en la tabla
        lastState = currentState; // Actualizar el estado previo
      }
    } else {
      console.error("Datos no disponibles en la API.");
    }
  } catch (error) {
    console.error("Error al obtener datos de ThingSpeak:", error);
  }
}

// Iniciar la monitorización en intervalos de 2 segundos
function startMonitoring() {
  setInterval(fetchData, 300);
}


// Limpiar registros de la tabla
function clearData() {
  document.getElementById("fan-log").innerHTML = "";
}

// Configuración inicial al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  startMonitoring();
  document.getElementById("clear-data").addEventListener("click", clearData);
  document.getElementById("download-csv").addEventListener("click", downloadCSV);
});


document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeStyle = document.getElementById("theme-style");

  themeToggle.addEventListener("click", () => {
    if (themeStyle.getAttribute("href") === "styles-light.css") {
      themeStyle.setAttribute("href", "styles-dark.css");
      themeToggle.textContent = "Cambiar a Tema Claro";
    } else {
      themeStyle.setAttribute("href", "styles-light.css");
      themeToggle.textContent = "Cambiar a Tema Oscuro";
    }
  });
});
