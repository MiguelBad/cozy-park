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
    let gameState = {};

    socket.onmessage = (event) => {
        gameState = JSON.parse(event.data);
        console.log(gameState);
    };

    /**
     * @type{{action:string, target:string|null, x: number, y:number}}
     */
    let status = { action: "idle", target: null, x: 0, y: 0 };

    window.addEventListener("keydown", function (event) {
        switch (event.key) {
            case "ArrowUp":
                status.action = "move";
                socket.send(JSON.stringify(status));
                break;
            case "ArrowDown":
                break;
            case "ArrowLeft":
                break;
            case "ArrowRight":
                break;
        }
    });
}
