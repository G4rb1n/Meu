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
    const tablesList = document.getElementById('tablesList');
    tablesList.innerHTML = ''; // Limpa os itens existentes

    try {
        const response = await fetch(`${API_BASE_URL}/ColumnByBoardId?BoardId=${boardId}`);
        if (await handleError(response)) return;

        const tablesResponse = await response.json();

        tablesResponse.forEach((table) => {
            createListItem(tablesList, table.Name, () => {
                alert(`Table selecionado: ${table.Id}`);
                showTask(table.Id);
            });
        });

        tablesList.style.display = 'block'; // Exibe a lista de tables
    } catch (error) {
        console.log(error);
    }
}

async function showTask(tableId) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Limpa os itens existentes

    try {
        const response = await fetch(`${API_BASE_URL}/TasksByColumnId?ColumnId=${tableId}`);
        if (await handleError(response)) return;

        const tasksResponse = await response.json();

        tasksResponse.forEach((task) => {
            createListItem(taskList, task.Title, () => {
                alert(`Task selecionada: ${task.Id}`);
            });
        });
    } catch (error) {
        console.log(error);
    }
}
