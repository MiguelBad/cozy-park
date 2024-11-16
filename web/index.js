document.addEventListener("DOMContentLoaded", function () {
    main();
});

function main() {
    /**
     * @type {HTMLCanvasElement|HTMLElement|null}
     */
    const canvas = document.getElementById("gameCanvas");
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("gameCanvas is not an HTMLCanvasElement");
    }

    const context = canvas.getContext("2d");
    const socket = new WebSocket("ws://localhost:1205/ws");

    socket.onmessage = (event) => {
        // /**
        //  * @type{{ id: string, status: { action: string, target: string, x: number, y: number}}}
        //  */
        const gameState = JSON.parse(event.data);
        renderGame(gameState);
    };

    window.addEventListener("keydown", function (event) {
        switch (event.key) {
            case "w":
                sendMovement("move", "w", socket);
                break;
            case "a":
                sendMovement("move", "a", socket);
                break;
            case "s":
                sendMovement("move", "s", socket);
                break;
            case "d":
                sendMovement("move", "d", socket);
                break;
        }
    });

    /**
     * @param {string} actionType
     * @param {string} key
     */
}

/**
 * @param{{ id: string, status: { action: string, target: string, x: number, y: number}}} gameState
 */
function renderGame(gameState) {}

/**
 * @param {string} actionType
 * @param {string} key
 * @param {WebSocket} socket
 */
function sendMovement(actionType, key, socket) {
    /**
     * @type{{action:string,  x: number, y:number}}
     */
    const status = { action: actionType, x: 0, y: 0 };
    status.action = "move";
    socket.send(JSON.stringify(status));
}
