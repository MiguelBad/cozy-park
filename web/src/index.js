/**
 * @typedef {{ blueWalkLeft: HTMLImageElement[]; blueWalkRight: HTMLImageElement[]; pinkWalkLeft: HTMLImageElement[]; pinkWalkRight: HTMLImageElement[]; }} PlayerFrame
 * @typedef {{ action: string, target: string, x: number, y: number, frame: number, direction: string}} Status
 * @typedef { Object<string, Status>} PlayerState
 */

var userId = "";

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

    const intialCtx = canvas.getContext("2d");
    if (!(intialCtx instanceof CanvasRenderingContext2D)) {
        throw new Error("failed to create canvas context");
    }
    const canvasCtx = intialCtx;

    const socket = new WebSocket("ws://localhost:1205/ws");

    /**
     * @type {PlayerState}
     */
    const playerState = {};
    socket.onmessage = (event) => {
        const serverMessage = JSON.parse(event.data);
        switch (serverMessage.type) {
            case "playerState":
                playerState[serverMessage.id] = serverMessage.status;
                break;
            case "clientInfo":
                userId = serverMessage.id;
                break;
        }
    };

    /**
     * @type {string}
     */
    let lastPressed;
    window.addEventListener("keydown", (event) => {
        if (lastPressed === event.key) {
            return;
        }

        console.log(userId);
        lastPressed = event.key;

        const pos = {
            x: playerState[userId].x,
            y: playerState[userId].y,
        };
        switch (event.key) {
            case "w":
                pos.y += 10;
                break;
            case "a":
                pos.x -= 10;
                break;
            case "s":
                pos.y += 10;
                break;
            case "d":
                pos.x += 10;
                break;
        }

        socket.send(JSON.stringify(pos));
    });

    window.addEventListener("keyup", () => {
        lastPressed = "";
    });

    const fps = 12;
    const interval = 1000 / fps;
    let lastFrameTime = 0;
    /**
     * @param {number} timestamp
     */
    function gameLoop(timestamp) {
        const elapsed = timestamp - lastFrameTime;
        if (elapsed > interval) {
            lastFrameTime = timestamp - (elapsed % interval);
            renderGame(playerState, canvasCtx, playerFrame);
        }
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

/**
 * @param {PlayerState} playerState
 * @param {CanvasRenderingContext2D} context
 * @param {PlayerFrame} playerFrame
 */
function renderGame(playerState, context, playerFrame) {
    context.clearRect(0, 0, 1000, 500);
    for (const player in playerState) {
        const state = playerState[player];
        context.drawImage(playerFrame.blueWalkRight[0], state.x, state.y);
    }
}

// class handleMovement {
//     /**
//      * @param {number} x
//      * @param {number} y
//      */
//     constructor(x, y) {
//         this.x = x;
//         this.y = y;
//         this.moving = false;
//     }
//
//     /**
//      * @param {number} end
//      * @param {number} alpha
//      * @returns {{x: number, y: number}}
//      */
//     interpolate(end, alpha) {
//         return {
//             x: this.x + (this.x - end) * alpha,
//             y: this.y + (this.y - end) * alpha,
//         };
//     }
//
//     extrapolate() {}
// }
