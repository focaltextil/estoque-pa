// URL da planilha no Google Sheets no formato CSV
const fileUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4eL_StwXZnZrikVfRucRYOO_stX6InEBMSNUIyF_e8r0aKN-ACp4u0QFVJ8JgyFGMu7ra1J7Fwaaw/pub?gid=905962302&single=true&output=csv';

let allData = []; // Vari�vel global para armazenar os dados

// Fun��o para carregar os dados da planilha
async function loadExcelData() {
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Erro ao baixar a planilha: ${response.statusText}`);
        }
        const csvData = await response.text();

        // Processa o CSV lidando com aspas duplas
        const rows = csvData
            .split('\n') // Divide o CSV em linhas
            .map(row => {
                return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/) // Divide em colunas sem quebrar dentro de aspas
                    .map(cell => cell.replace(/^"|"$/g, '').trim()); // Remove aspas duplas ao redor e espa�os extras
            });

        rows.shift(); // Remove o cabe�alho
        return rows;
    } catch (error) {
        console.error(`Erro ao carregar os dados: ${error.message}`);
        alert('Erro ao carregar os dados da planilha.');
        return [];
    }
}

// Fun��o para renderizar os dados na tabela
function renderData(data) {
    const renderContainer = document.getElementById("render-container");
    renderContainer.innerHTML = ''; // Limpa os dados existentes

    data.forEach(row => {
        const tableRow = document.createElement("tr");

        const tdCodigo = document.createElement("td");
        tdCodigo.textContent = row[0] || 'Sem C�digo';

        const tdNome = document.createElement("td");
        tdNome.textContent = row[1] || 'Sem Nome';

        const tdEstoque = document.createElement("td");
        tdEstoque.textContent = row[2]?.replace('.', ',') || '0'; // Substitui ponto por v�rgula, se necess�rio

        const tdObs = document.createElement("td");
        tdObs.textContent = row[3] || '';

        tableRow.appendChild(tdCodigo);
        tableRow.appendChild(tdNome);
        tableRow.appendChild(tdEstoque);
        tableRow.appendChild(tdObs);

        renderContainer.appendChild(tableRow);
    });
}

// Fun��o para filtrar os dados com base na busca
function filterData(searchText) {
    const filteredData = allData.filter(row => {
        return row[1] && row[1].toLowerCase().includes(searchText.toLowerCase());
    });
    renderData(filteredData);
}

// Inicializa��o da p�gina
async function init() {
    allData = await loadExcelData();
    renderData(allData);

    // Configura��es de eventos
    document.getElementById('searchInput').addEventListener('input', function () {
        const searchText = this.value.trim();
        if (searchText) {
            filterData(searchText);
        } else {
            renderData(allData);
        }
    });

    document.getElementById('reload').addEventListener('click', async function () {
        allData = await loadExcelData();
        renderData(allData);
    });
}

// Chama a inicializa��o ao carregar a p�gina
window.onload = init;
