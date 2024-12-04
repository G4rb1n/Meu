import { API_BASE_URL } from "../../config/apiConfig.js";
import { saveToLocalStorage } from "../utils/storage.js";

// Função de tratamento de erros
async function handleError(response) {
    if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.Errors ? errorData.Errors[0] : "Erro inesperado.");
        return true;
    }
    return false;
}

// Seleciona o botão de alternância de tema
const themeToggle = document.getElementById('themeToggle');

// Adiciona evento de clique para alternar o tema
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme'); // Alterna a classe do corpo

  // Armazena a preferência do tema no localStorage
  const isLightTheme = document.body.classList.contains('light-theme');
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
});

// Aplica o tema salvo no localStorage ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
});


// Função para criar e adicionar itens na lista
function createListItem(parentElement, textContent, callback) {
    const item = document.createElement('li');
    item.innerHTML = `<a>${textContent}</a>`;
    item.addEventListener('click', callback);
    parentElement.appendChild(item);
}

document.querySelector('#selecionar').addEventListener('click', async (event) => {
    event.preventDefault();

    const dropdownMenu = document.getElementById('boardsList');
    const colunasDiv = document.getElementById('colunas');
    const backButton = document.getElementById('backToBoards');

    // Garante que apenas a lista de boards esteja visível
    dropdownMenu.style.display = 'block';
    colunasDiv.style.display = 'none';

    // Remove o botão de voltar, se existir
    if (backButton) backButton.remove();

    // Limpa os itens existentes na lista de boards
    dropdownMenu.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/Boards`);
        if (await handleError(response)) return;

        const boardsResponse = await response.json();

        boardsResponse.forEach((board) => {
            createListItem(dropdownMenu, board.Name, () => {
                alert(`Board selecionado: ${board.Id}`);
                showTables(board.Id);

                dropdownMenu.style.display = 'none'; // Esconde a lista de boards
                document.body.appendChild(createBackButton()); // Adiciona o botão de voltar
            });
        });
    } catch (error) {
        console.log(error);
    }
});


async function showTables(boardId) {
    const colunasDiv = document.getElementById("colunas");
    colunasDiv.innerHTML = ''; // Limpa os itens existentes

    try {
        const response = await fetch(`${API_BASE_URL}/ColumnByBoardId?BoardId=${boardId}`);
        if (await handleError(response)) return;

        const tablesResponse = await response.json();

        tablesResponse.forEach((table) => {
            // Cria uma coluna
            const coluna = document.createElement("div");
            coluna.className = "col-individual";
            coluna.innerHTML = `<h2>${table.Name}</h2>`;

            // Adiciona um contêiner de tarefas à coluna
            const tasksDiv = document.createElement("div");
            tasksDiv.id = `tasks-${table.Id}`;
            tasksDiv.className = "tasks-container";
            tasksDiv.innerHTML = "<p>Carregando tarefas...</p>";

            coluna.appendChild(tasksDiv);
            colunasDiv.appendChild(coluna);

            // Carrega as tarefas para a coluna
            showTasks(table.Id, tasksDiv);
        });

        colunasDiv.style.display = 'flex'; // Garante que as colunas sejam exibidas lado a lado
    } catch (error) {
        console.log(error);
    }
}

async function showTasks(columnId, tasksDiv) {
    tasksDiv.innerHTML = ''; // Limpa o conteúdo anterior

    try {
        const response = await fetch(`${API_BASE_URL}/TasksByColumnId?ColumnId=${columnId}`);
        if (await handleError(response)) return;

        const tasksResponse = await response.json();
 //       alert(tasksResponse(tasksResponse));

        tasksResponse.forEach((task) => {
            // Cria uma tarefa
            const taskDiv = document.createElement("div");
            taskDiv.className = "task-individual";
            taskDiv.setAttribute("draggable", "true");
            taskDiv.innerHTML = `<p>${task.Title}</p>`;

            tasksDiv.appendChild(taskDiv);
        });
    } catch (error) {
        console.log(error);
        tasksDiv.innerHTML = "<p>Erro ao carregar tarefas.</p>";
    }
}
