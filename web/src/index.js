/**
 * @typedef {{ blueWalkLeft: HTMLImageElement[]; blueWalkRight: HTMLImageElement[]; pinkWalkLeft: HTMLImageElement[]; pinkWalkRight: HTMLImageElement[]; }} PlayerFrame
 * @typedef {{ color: string, action: string, target: string, x: number, y: number, frame: number, changeFrame: boolean, facing: string}} State
 * @typedef { Object<string, State>} PlayerState
 */

let userId = "";
let color = "";
const canvasWidth = 2496;
const canvasHeight = canvasWidth * (3 / 5);
const startingPos = {
    x: 2200,
    y: 1300,
};

document.addEventListener("DOMContentLoaded", async function () {
    const playerFrame = await fetchPlayerFrames();
    playerSelect()
        .then((selected) => {
            color = selected;
            main(playerFrame);
        })
        .catch(() => {
            console.error("failed to select player");
        });
});

/**
 * @param {PlayerFrame} playerFrame
 */
function main(playerFrame) {
    const canvasContainer = document.getElementById("game-canvas--container");
    if (!(canvasContainer instanceof HTMLDivElement)) {
        throw new Error("cannot find game canvas container");
    }
    canvasContainer.hidden = false;

    const initialCanvasBackground = document.getElementById("background-canvas");
    if (!(initialCanvasBackground instanceof HTMLCanvasElement)) {
        throw new Error("cannot find game canvas background element");
    }
    const canvasBackground = initialCanvasBackground;

    const initialPlayerCanvas = document.getElementById("player-canvas");
    if (!(initialPlayerCanvas instanceof HTMLCanvasElement)) {
        throw new Error("cannot find game canvas");
    }
    const playerCanvas = initialPlayerCanvas;

    const initialGameCanvas = document.getElementById("game-canvas");
    if (!(initialGameCanvas instanceof HTMLCanvasElement)) {
        throw new Error("cannot find game canvas");
    }
    const gameCanvas = initialGameCanvas;

    let clientWidth = window.innerWidth - 20;
    const aspectRatio = 9 / 16;
    let clientHeight = clientWidth * aspectRatio;
    /**
     * @param {HTMLDivElement} canvasContainer
     */
    function clientDimension(canvasContainer) {
        clientWidth = window.innerWidth - 20;
        clientHeight = clientWidth * aspectRatio;
        if (clientHeight > 1080) {
            clientHeight = 1080;
        }
        if (clientHeight > canvasHeight) {
            clientHeight = canvasHeight;
        }
        if (clientWidth > 1920) {
            clientWidth = 1920;
        }
        if (clientWidth > canvasWidth) {
            clientWidth = canvasWidth;
        }
        if (window.innerHeight < clientHeight) {
            clientHeight = window.innerHeight - 20;
            clientWidth = clientHeight * (16 / 9);
        }
        canvasContainer.style.height = `${clientHeight}px`;
        canvasContainer.style.width = `${clientWidth}px`;
    }
    window.addEventListener("resize", () => {
        clientDimension(canvasContainer);
    });
    clientDimension(canvasContainer);

    const initialGameCtx = gameCanvas.getContext("2d");
    if (!(initialGameCtx instanceof CanvasRenderingContext2D)) {
        throw new Error("failed to create canvas context");
    }
    const gameCtx = initialGameCtx;

    const initialPlayerCtx = gameCanvas.getContext("2d");
    if (!(initialPlayerCtx instanceof CanvasRenderingContext2D)) {
        throw new Error("failed to create canvas context");
    }
    const playerCtx = initialPlayerCtx;

    const socket = new WebSocket("ws://localhost:1205/ws");

    socket.onopen = () => {
        socket.send(
            JSON.stringify({
                type: "",
                data: { x: startingPos.x, y: startingPos.y, facing: "left", color: color },
            })
        );
    };

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
    let keys = {};
    const movementKeys = ["w", "a", "s", "d"];
    document.addEventListener("keydown", (event) => {
        if (keys[event.key.toLowerCase()]) {
            return;
        }
        keys[event.key.toLowerCase()] = true;
    });
    document.addEventListener("keyup", (event) => {
        keys[event.key.toLowerCase()] = false;
    });
    window.addEventListener("blur", () => {
        for (const key in keys) {
            keys[key] = false;
        }
    });
    window.addEventListener(
        "wheel",
        (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
            }
        },
        { passive: false }
    );

    const fps = 20;
    const interval = 1000 / fps;
    let lastFrameTime = 0;
    const playerHeight = 64;
    const playerWidth = 64;
    let moveValX = 2;
    let moveValY = 2;
    /**
     * @param {number} timestamp
     */
    function gameLoop(timestamp) {
        const elapsed = timestamp - lastFrameTime;

        if (!userId || !playerState || !color) {
            gameCtx.font = "50px Arial";
            gameCtx.fillText("Loading...", canvasWidth / 2, canvasHeight / 2);
            requestAnimationFrame(gameLoop);
            return;
        }

        const data = {
            x: playerState[userId].x,
            y: playerState[userId].y,
            facing: playerState[userId].facing,
            frame: playerState[userId].frame,
            changeFrame: playerState[userId].changeFrame,
        };

        if (elapsed > interval) {
            if (keys.w && data.y > 20) {
                data.y -= moveValY;
                increaseMoveValY();
            }
            if (keys.a && data.x > 20) {
                data.x -= moveValX;
                increaseMoveValX();
            }
            if (keys.s && data.y + playerHeight < canvasHeight - 20) {
                data.y += moveValY;
                increaseMoveValY();
            }
            if (keys.d && data.x + playerWidth < canvasWidth - 20) {
                data.x += moveValX;
                increaseMoveValX();
            }
            if (!(keys.a && keys.d)) {
                if (keys.a) {
                    data.facing = "left";
                } else if (keys.d) {
                    data.facing = "right";
                }
            }
            function increaseMoveValX() {
                if (moveValX < 10) {
                    moveValX += 4;
                }
                if (keys["shift"] && moveValX < 15) {
                    moveValX += 2;
                }
                if (!keys["shift"] && moveValX > 10) {
                    moveValX = 10;
                }
            }
            function increaseMoveValY() {
                if (moveValY < 10) {
                    moveValY += 4;
                }
                if (keys["shift"] && moveValY < 15) {
                    moveValY += 2;
                }
                if (!keys["shift"] && moveValY > 10) {
                    moveValY = 10;
                }
            }

            let xTranslate = clientWidth / 2 - playerWidth / 2 - data.x;
            let yTranslate = clientHeight / 2 - playerHeight / 2 - data.y;
            playerCanvas.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;
            gameCanvas.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;
            canvasBackground.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;

            lastFrameTime = timestamp - (elapsed % interval);
            const walking = movementKeys.some((key) => keys[key]);
            if (walking) {
                if (keys["shift"]) {
                    data.changeFrame = true;
                }
                if (data.changeFrame) {
                    data.frame += 1;
                    data.changeFrame = false;
                } else {
                    data.changeFrame = true;
                }
                if (data.frame > 2) {
                    data.frame = 0;
                }
                if (
                    (keys.a && keys.d && !(keys.w || keys.s)) ||
                    (keys.w && keys.s && !(keys.a || keys.d))
                ) {
                    data.frame = 0;
                }
            } else {
                data.frame = 0;
                moveValX = 2;
                moveValY = 2;
            }

            renderGame(playerState, gameCtx, playerCtx, playerFrame);
            socket.send(JSON.stringify({ type: "move", data: data }));
            console.log(data.x, data.y);
        }
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}

/**
 * @param {PlayerState} playerState
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {CanvasRenderingContext2D} playerCtx
 * @param {PlayerFrame} playerFrame
 */
function renderGame(playerState, gameCtx, playerCtx, playerFrame) {
    gameCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    playerCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    /**
     * @param {string} player
     */
    function renderPlayer(player) {
        const state = playerState[player];

        let walkingFrame = playerFrame.pinkWalkRight;
        if (playerState[player].color === "blue") {
            walkingFrame = playerFrame.blueWalkRight;
        }
        if (playerState[player].facing === "left") {
            walkingFrame = playerFrame.pinkWalkLeft;
            if (playerState[player].color === "blue") {
                walkingFrame = playerFrame.blueWalkLeft;
            }
        }
        playerCtx.drawImage(walkingFrame[state.frame], state.x, state.y);
    }

    for (const player in playerState) {
        if (player === userId) {
            continue;
        }
        renderPlayer(player);
    }

    renderPlayer(userId);
}
