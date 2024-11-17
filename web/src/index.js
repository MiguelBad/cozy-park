/**
 * @typedef {{ blueWalkLeft: HTMLImageElement[]; blueWalkRight: HTMLImageElement[]; pinkWalkLeft: HTMLImageElement[]; pinkWalkRight: HTMLImageElement[]; }} PlayerFrame
 * @typedef {{ action: string, target: string, x: number, y: number, frame: number, direction: string, pressing: boolean}} Status
 * @typedef {{ id: string, status: Status}} PlayerState
 */

document.addEventListener("DOMContentLoaded", async function () {
    const playerFrame = await fetchPlayerFrames();
    main(playerFrame);
});

/**
 * @param {PlayerFrame} playerFrame
 */
function main(playerFrame) {
    /**
     * @type {HTMLCanvasElement|HTMLElement|null}
     */
    const canvas = document.getElementById("gameCanvas");
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("gameCanvas is not an HTMLCanvasElement");
    }
    canvas.height = 700;
    canvas.width = 1200;

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("failed to create canvas context");
    }

    const socket = new WebSocket("ws://localhost:1205/ws");

    /**
     * @type{PlayerState}
     */
    let playerState;

    socket.onmessage = (event) => {
        playerState = JSON.parse(event.data);
        renderGame(playerState, context, playerFrame);
    };

    /**
     * @type {string}
     */
    let lastPressed;
    window.addEventListener("keydown", (event) => {
        if (lastPressed === event.key) {
            return;
        }

        lastPressed = event.key;
        switch (event.key) {
            case "w":
                sendData("move", socket, "w");
                break;
            case "a":
                sendData("move", socket, "a");
                break;
            case "s":
                sendData("move", socket, "s");
                break;
            case "d":
                sendData("move", socket, "d");
                break;
        }
    });

    window.addEventListener("keyup", () => {
        lastPressed = "";
        sendData("stop", socket);
    });
}

/**
 * @param {PlayerState} playerState
 * @param {CanvasRenderingContext2D} context
 * @param {PlayerFrame} playerFrame
 */
function renderGame(playerState, context, playerFrame) {
    context.clearRect(0, 0, 1000, 500);
    context.drawImage(playerFrame.blueWalkRight[0], playerState.status.x, playerState.status.y);
}

/**
 * @param {string} actionType
 * @param {WebSocket} socket
 * @param {string} [key]
 */
function sendData(actionType, socket, key) {
    const action = {
        type: actionType,
        key: key,
    };
    socket.send(JSON.stringify(action));
}
