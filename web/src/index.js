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
     * @type {Object<string, boolean>}
     */
    let keys = {
        w: false,
        a: false,
        s: false,
        d: false,
    };
    window.addEventListener("keydown", (event) => {
        if (keys[event.key]) {
            return;
        }
        console.log(event.key);

        keys[event.key] = true;
    });

    window.addEventListener("keyup", (event) => {
        keys[event.key] = false;
    });

    const fps = 12;
    const interval = 1000 / fps;
    let lastFrameTime = 0;
    /**
     * @param {number} timestamp
     */
    function gameLoop(timestamp) {
        const elapsed = timestamp - lastFrameTime;
        const pos = {
            x: playerState[userId].x,
            y: playerState[userId].y,
        };
        if (elapsed > interval) {
            if (keys.w) {
                pos.y -= 10;
            }

            if (keys.a) {
                pos.x -= 10;
            }

            if (keys.s) {
                pos.y += 10;
            }

            if (keys.d) {
                pos.x += 10;
            }
            socket.send(JSON.stringify(pos));

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
