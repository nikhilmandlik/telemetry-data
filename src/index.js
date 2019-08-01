
const FETCH_TIME_DIFF = 15 * 60 * 1000; // 15 minutes
const endpoints = document.querySelector('.endpoints');
const table = document.querySelector('table');
const SORT_TYPES = ['id','timestamp','value'];
let sortColumn = SORT_TYPES[1];
let sortAscending = false;
let webSocket = null;

const init = () => {
    createWebsocket();

    const table = document.querySelector('table');
    if (!table) {
        return;
    }

    clearTable();
}

const clearTable = () => {
    table.tBodies[0].parentNode.replaceChild(document.createElement('tbody'), table.tBodies[0]);
}

const updateTable = (pointId, enabled) => {
    if (!enabled) {
        subscribeRealTimeData(pointId, true);
        return removeTableEntries(pointId);
    }

    // fetch historic data
    fetchHistoricalData(pointId)
        .then((data) => {
            addTableEntries(data);
        });
    
    // fetch realtime data
    subscribeRealTimeData(pointId);
}

const addTableEntries = (data) => {
    data.forEach((row) => {
        const contentRow = document.createElement('tr');
        const id = document.createElement('td');
        id.textContent = row.id;
        const timestamp = document.createElement('td');
        timestamp.textContent = new Date(row.timestamp).toISOString();
        const value = document.createElement('td');
        value.textContent = row.value;
        contentRow.appendChild(id);
        contentRow.appendChild(timestamp);
        contentRow.appendChild(value);
        table.tBodies[0].append(contentRow);
    });

    sortTable();
}

const removeTableEntries = (pointId) => {
    const contents = Array.from(table.tBodies[0].rows);
    clearTable();

    const newContents = contents.filter((row) => row.cells[0].textContent.toString() !== pointId.toString());
    table.tBodies[0].append(...newContents);

    // Unsubscribe from realtime data
}

const sortTable = () => {
    const contents = Array.from(table.tBodies[0].rows);
    let compare;
    
    switch (sortColumn) {
        case SORT_TYPES[0]:
            compare = (rowA, rowB) => {
                const idA = rowA.cells[0].textContent.toString();
                const idB = rowB.cells[0].textContent.toString();
                return sortAscending 
                    ? idA > idB ? 1 : -1
                    : idA < idB ? 1 : -1;
            };
            break;
        case SORT_TYPES[1]:
            compare = (rowA, rowB) => {
                const timestampA = new Date(rowA.cells[1].textContent).getTime();
                const timestampB = new Date(rowB.cells[1].textContent).getTime();
                return sortAscending 
                    ? timestampA > timestampB ? 1 : -1
                    : timestampA < timestampB ? 1 : -1;
            };
            break;
        case SORT_TYPES[2]:
            compare = (rowA, rowB) => {
                const valueA = rowA.cells[2].textContent.toString();
                const valueB = rowB.cells[2].textContent.toString();
                return sortAscending
                    ? valueA - valueB
                    : valueB - valueA;
            };
            break;
    }

    // sort
    contents.sort(compare);
    table.tBodies[0].append(...contents);
}

const createWebsocket = () => {
    const realtimeDataBaseUrl = "ws://localhost:8080/realtime";
    var browserSupportWebsockets = ('WebSocket' in window);
    if (!browserSupportWebsockets) {
        console.error('Websocket Error: No realtime data');
        return;
    }

    webSocket = new WebSocket(realtimeDataBaseUrl); 
    // When the connection is open
    webSocket.onopen = function () {
    };

    // Log errors
    webSocket.onerror = function (error) {
    };

    // Log messages from the server
    webSocket.onmessage = function (e) {
        addTableEntries([JSON.parse(e.data)]);
    };
}

// event handlers
const handleCheckBoxClicks = (event) => {
    if (event.target.tagName !== 'INPUT') {
        return;
    }

    const id = event.target.id
    const enabled = event.target.checked;
    updateTable(id, enabled);
}

const handleSort = (event) => {
    if (event.target.tagName != 'TH') return;

    let th = event.target;
    if (th.classList.contains('selected')) {
        sortAscending = !sortAscending;
    } else {
        sortAscending = true;
        table.querySelectorAll('th').forEach((th) => {
            th.classList = '';
        });
    }
    const className = `selected ${sortAscending ? 'ascending' : 'descending'}`;
    th.classList = className;
    
    sortColumn = SORT_TYPES[th.cellIndex];
    sortTable();
}

endpoints.addEventListener('click', handleCheckBoxClicks);
table.addEventListener('click', handleSort);

// data providers
const fetchHistoricalData = (pointId) => {
    if (!pointId) {
        return new Promise ((resolve) => resolve(false));
    }

    const EndTime = Date.now();
    const startTime = EndTime - FETCH_TIME_DIFF;
    
    const historicalDataBaseUrl = "http://localhost:8080/history/";
    const url = `${historicalDataBaseUrl}${pointId}?start=${startTime}&end=${EndTime}`;

    return new Promise((resolve) => {
        fetch(url)
        .then((response) => response.json())
        .then((data) => resolve(data))

    });
}

const subscribeRealTimeData = (pointId, unsubscribe) => {
    webSocket.send(`${unsubscribe ? 'unsubscribe' : 'subscribe'} ${pointId}`);
}

init();