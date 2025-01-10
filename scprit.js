const fileUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4eL_StwXZnZrikVfRucRYOO_stX6InEBMSNUIyF_e8r0aKN-ACp4u0QFVJ8JgyFGMu7ra1J7Fwaaw/pub?gid=905962302&single=true&output=csv';

let allData = [];

async function loadExcelData() {
    try {
        // Verifica se os dados est�o no sessionStorage
        const savedData = sessionStorage.getItem('excelData');
        if (savedData) {
            // Se estiverem, retorna os dados salvos
            return JSON.parse(savedData);
        }

        // Se n�o estiverem, baixa os dados da planilha
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Erro ao baixar a planilha: ${response.statusText}`);
        }
        const csvData = await response.text();

        const rows = csvData
            .split('\n')
            .map(row => {
                return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                    .map(cell => cell.replace(/^"|"$/g, '').trim());
            });

        rows.shift(); // Remove a primeira linha (cabe�alho)

        // Salva os dados no sessionStorage para futuras consultas
        sessionStorage.setItem('excelData', JSON.stringify(rows));

        return rows;
    } catch (error) {
        console.error(`Erro ao carregar os dados: ${error.message}`);
        alert('Erro ao carregar os dados da planilha.');
        return [];
    }
}

function renderTable(data) {
    const renderContainer = document.getElementById("render-container");
    renderContainer.innerHTML = '';

    data.forEach(row => {
        const tableRow = document.createElement("tr");

        const tdCodigo = document.createElement("td");
        tdCodigo.textContent = row[0] || 'Sem C�digo';

        const tdNome = document.createElement("td");
        tdNome.textContent = row[1] || 'Sem Nome';

        const tdEstoque = document.createElement("td");
        tdEstoque.textContent = row[2]?.replace('.', ',') || '0';

        const tdObs = document.createElement("td");
        tdObs.textContent = row[4] || '';

        tableRow.appendChild(tdCodigo);
        tableRow.appendChild(tdNome);
        tableRow.appendChild(tdEstoque);
        tableRow.appendChild(tdObs);

        renderContainer.appendChild(tableRow);
    });
}

function renderCards(data) {
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = '';

    data.forEach(row => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="card-content">
                <h4>Codigo: ${row[0] || "Sem Codigo"}</h4>
                <p><strong>Nome:</strong> ${row[1] || "Sem Nome"}</p>
                <p><strong>Estoque:</strong> ${row[2]?.replace(".", ",") || "0"}</p>
                <p><strong>Obs:</strong> ${row[4] || ""}</p>
            </div>
        `;

        cardContainer.appendChild(card);
    });
}

function filterData(searchText) {
    const searchPattern = searchText.replace(/%/g, '.*');
    const regex = new RegExp(searchPattern, 'i');

    const filteredData = allData.filter(row => {
        return row.some(cell => regex.test(cell));
    });

    renderData(filteredData);
}

function updateView() {
    const isMobile = window.innerWidth <= 768;
    document.querySelector(".table-container").style.display = isMobile ? "none" : "block";
    document.querySelector(".card-container").style.display = isMobile ? "flex" : "none";
}

function renderData(data) {
    renderTable(data);  // Atualiza a tabela
    renderCards(data);  // Atualiza os cards
    updateView();       // Alterna entre tabela e cards
}

async function init() {
    // Carrega os dados e renderiza
    allData = await loadExcelData();
    renderData(allData);

    // Adiciona o evento de busca
    document.getElementById('searchInput').addEventListener('input', function () {
        const searchText = this.value.trim();
        if (searchText) {
            filterData(searchText);
        } else {
            renderData(allData);
        }
    });

    // Adiciona o evento de recarregar os dados
    document.getElementById('reload').addEventListener('click', async function () {
        allData = await loadExcelData();
        renderData(allData);
    });

    // Adiciona o evento de redimensionamento da tela
    window.addEventListener("resize", updateView);
    updateView();
}

window.onload = init;
