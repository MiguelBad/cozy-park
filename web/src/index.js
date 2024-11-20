/**
 * @typedef {{ blueWalkLeft: HTMLImageElement[]; blueWalkRight: HTMLImageElement[]; pinkWalkLeft: HTMLImageElement[]; pinkWalkRight: HTMLImageElement[]; }} PlayerFrame
 * @typedef {{ action: string, target: string, x: number, y: number, frame: number, facing: string}} State
 * @typedef { Object<string, State>} PlayerState
 */

var userId = "";

document.addEventListener("DOMContentLoaded", async function() {
    const playerFrame = await fetchPlayerFrames();
    main(playerFrame);
});

/**
 * @param {PlayerFrame} playerFrame
 */
function main(playerFrame) {
    const initialCanvas = document.getElementById("game-canvas");
    if (!(initialCanvas instanceof HTMLCanvasElement)) {
        throw new Error("cannot find game canvas");
    }
    const canvas = initialCanvas;
    const aspectRatio = 1920 / 1080;
    let clientHeight = window.innerHeight - 20;
    let clientWidth = clientHeight * aspectRatio;
    if (clientHeight > 1080) {
        clientHeight = 1080;
    }

    if (clientWidth > 1920) {
        clientWidth = 1920;
    }

    canvas.height = clientHeight;
    canvas.width = clientWidth;

    const intialCtx = canvas.getContext("2d");
    if (!(intialCtx instanceof CanvasRenderingContext2D)) {
        throw new Error("failed to create canvas context");
    }
    const canvasCtx = intialCtx;

    const socket = new WebSocket("ws://192.168.1.113:1205/ws");

    /**
     * @type {PlayerState}
     */
    const playerState = {};
    socket.onmessage = (event) => {
        const serverMessage = JSON.parse(event.data);
        switch (serverMessage.type) {
            case "playerState":
                playerState[serverMessage.id] = serverMessage.state;
                break;
            case "connected":
                userId = serverMessage.id;
                break;
            case "disconnected":
                const disconnectedP = serverMessage.id;
                delete playerState[disconnectedP];
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
        keys[event.key] = true;
    });
    window.addEventListener("keyup", (event) => {
        keys[event.key] = false;
    });

    const fps = 24;
    const interval = 1000 / fps;
    const walkingInterval = interval / 3;
    let currFrameIdx = 0;
    let lastFrameTime = 0;
    /**
     * @param {number} timestamp
     */
    function gameLoop(timestamp) {
        const elapsed = timestamp - lastFrameTime;

        if (!userId || !playerState) {
            canvasCtx.font = "50px Arial";
            canvasCtx.fillText("Loading...", canvas.width / 2, canvas.height / 2);
            requestAnimationFrame(gameLoop);
            return;
        }

        const pos = {
            x: playerState[userId].x,
            y: playerState[userId].y,
            facing: playerState[userId].facing,
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

            if (!(keys.a && keys.d)) {
                if (keys.a) {
                    pos.facing = "left";
                } else if (keys.d) {
                    pos.facing = "right";
                }
            }

            socket.send(JSON.stringify(pos));

            lastFrameTime = timestamp - (elapsed % interval);
            const walking = Object.keys(keys).some((key) => keys[key]);
            if (walking) {
                currFrameIdx += 1;
                if (currFrameIdx > 2) {
                    currFrameIdx = 0;
                }

                if (keys.a && keys.d && !(keys.w || keys.s)) {
                    currFrameIdx = 0;
                }

                renderGame(playerState, canvas, canvasCtx, playerFrame, currFrameIdx);
            } else {
                currFrameIdx = 0;
                renderGame(playerState, canvas, canvasCtx, playerFrame, currFrameIdx);
            }
        }
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}

/**
 * @param {PlayerState} playerState
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} context
 * @param {PlayerFrame} playerFrame
 * @param {number} currFrameIdx
 */
function renderGame(playerState, canvas, context, playerFrame, currFrameIdx) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const player in playerState) {
        const state = playerState[player];

        let walkingFrame = playerFrame.blueWalkRight;
        if (playerState[userId].facing === "left") {
            walkingFrame = playerFrame.blueWalkLeft;
        }
        context.drawImage(walkingFrame[currFrameIdx], state.x, state.y);
    }
}
