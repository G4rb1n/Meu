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

// Função para criar e adicionar itens na lista
function createListItem(parentElement, textContent, callback) {
    const item = document.createElement('li');
    item.innerHTML = `<a>${textContent}</a>`;
    item.addEventListener('click', callback);
    parentElement.appendChild(item);
}

document.querySelector('.button-toggle-taskboard').addEventListener('click', async (event) => {
    event.preventDefault();

    const dropdownMenu = document.getElementById('boardsList');
    dropdownMenu.innerHTML = ''; // Limpa os itens existentes

    try {
        const response = await fetch(`${API_BASE_URL}/Boards`);
        if (await handleError(response)) return;

        const boardsResponse = await response.json();

        boardsResponse.forEach((board) => {
            createListItem(dropdownMenu, board.Name, () => {
                alert(`Board selecionado: ${board.Id}`);
                showTables(board.Id);
                dropdownMenu.style.display = 'none'; // Esconde a lista de boards
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
