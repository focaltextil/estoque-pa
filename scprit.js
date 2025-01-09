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
        const workbook = XLSX.read(csvData, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        jsonData.shift(); // Remove o cabe�alho
        return jsonData;
    } catch (error) {
        console.error(`Erro ao carregar os dados: ${error.message}`);
        alert('Erro ao carregar os dados da planilha.');
        return [];
    }
}


function renderData(data) {
    const renderContainer = document.getElementById("render-container");
    renderContainer.innerHTML = ''; 

    data.forEach(row => {
        const tableRow = document.createElement("tr");

        const tdCodigo = document.createElement("td");
        tdCodigo.textContent = row[0] || 'Sem C�digo';

        const tdNome = document.createElement("td");
        tdNome.textContent = row[1] || 'Sem Nome';

        const tdEstoque = document.createElement("td");
        tdEstoque.textContent = row[2] || '0';

        const tdObs = document.createElement("td");
        tdObs.textContent = row[4] || '';

        tableRow.appendChild(tdCodigo);
        tableRow.appendChild(tdNome);
        tableRow.appendChild(tdEstoque);
        tableRow.appendChild(tdObs);

        renderContainer.appendChild(tableRow);
    });
}


function filterData(searchText) {
    const filteredData = allData.filter(row => {
        return row[1] && row[1].toLowerCase().includes(searchText.toLowerCase());
    });
    renderData(filteredData);
}

async function init() {
    allData = await loadExcelData();
    renderData(allData);

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
