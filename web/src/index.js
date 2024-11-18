/**
 * @typedef {{ blueWalkLeft: HTMLImageElement[]; blueWalkRight: HTMLImageElement[]; pinkWalkLeft: HTMLImageElement[]; pinkWalkRight: HTMLImageElement[]; }} PlayerFrame
 * @typedef {{ action: string, target: string, x: number, y: number, frame: number, direction: string}} Status
 * @typedef {{ id: string, status: Status}} PlayerState
 */

document.addEventListener("DOMContentLoaded", async function () {
    const playerFrame = await fetchPlayerFrames();
    main(playerFrame);
});

class handleMovement {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.moving = false;
    }

    /**
     * @param {number} end
     * @param {number} alpha
     * @returns {{x: number, y: number}}
     */
    interpolate(end, alpha) {
        return {
            x: this.x + (this.x - end) * alpha,
            y: this.y + (this.y - end) * alpha,
        };
    }

    extrapolate() {}
}

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

            /**
             * @type{PlayerState}
             */
            let playerState;

            socket.onmessage = (event) => {
                playerState = JSON.parse(event.data);
                renderGame(playerState, canvasCtx, playerFrame);
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
                        break;
                    case "a":
                        break;
                    case "s":
                        break;
                    case "d":
                        break;
                }
            });

            window.addEventListener("keyup", () => {
                lastPressed = "";
            });
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
    context.drawImage(playerFrame.blueWalkRight[0], playerState.status.x, playerState.status.y);
}
