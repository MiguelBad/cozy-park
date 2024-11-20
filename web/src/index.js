/**
 * @typedef {{ blueWalkLeft: HTMLImageElement[]; blueWalkRight: HTMLImageElement[]; pinkWalkLeft: HTMLImageElement[]; pinkWalkRight: HTMLImageElement[]; }} PlayerFrame
 * @typedef {{ color: string, action: string, target: string, x: number, y: number, frame: number, changeFrame: boolean, facing: string}} State
 * @typedef { Object<string, State>} PlayerState
 */

let userId = "";
let color = "";
const startingPos = {
    x: 1250,
    y: 750,
};

document.addEventListener("DOMContentLoaded", async function() {
    const playerFrame = await fetchPlayerFrames();
    playerSelect(playerFrame);
});

/**
 * @param {PlayerFrame} playerFrame
 */
function playerSelect(playerFrame) {
    const playerSelectMenu = document.getElementById("player-select--container");
    if (!(playerSelectMenu instanceof HTMLDivElement)) {
        throw new Error("did not found player select menu");
    }
    const blueOption = document.getElementById("player-select--blue");
    if (!(blueOption instanceof HTMLDivElement)) {
        throw new Error("did not found blue option");
    }
    const pinkOption = document.getElementById("player-select--pink");
    if (!(pinkOption instanceof HTMLDivElement)) {
        throw new Error("did not found pink option");
    }

    blueOption.addEventListener("click", () => {
        playerSelectMenu.style.display = "none";
        playerSelectMenu.hidden = true;
        color = "blue";
        main(playerFrame);
    });

    pinkOption.addEventListener("click", () => {
        playerSelectMenu.style.display = "none";
        playerSelectMenu.hidden = true;
        color = "pink";
        main(playerFrame);
    });
}

/**
 * @param {PlayerFrame} playerFrame
 */
function main(playerFrame) {
    const canvasContainer = document.getElementById("game-canvas--container");
    if (!(canvasContainer instanceof HTMLDivElement)) {
        throw new Error("cannot find game canvas container");
    }
    const initialCanvas = document.getElementById("game-canvas");
    if (!(initialCanvas instanceof HTMLCanvasElement)) {
        throw new Error("cannot find game canvas");
    }
    const canvas = initialCanvas;
    canvas.hidden = false;
    const aspectRatio = 16 / 9;

    canvas.width = 2500;
    canvas.height = 1500;
    let clientHeight = window.innerHeight - 20;
    let clientWidth = clientHeight * aspectRatio;
    if (clientHeight > 1080) {
        clientHeight = 1080;
    }
    if (clientHeight > canvas.height) {
        clientHeight = canvas.height;
    }
    if (clientWidth > 1920) {
        clientWidth = 1920;
    }
    if (clientWidth > canvas.width) {
        clientWidth = canvas.width;
    }
    canvasContainer.style.height = `${clientHeight}px`;
    canvasContainer.style.width = `${clientWidth}px`;

    const intialCtx = canvas.getContext("2d");
    if (!(intialCtx instanceof CanvasRenderingContext2D)) {
        throw new Error("failed to create canvas context");
    }
    const canvasCtx = intialCtx;

    const socket = new WebSocket("ws://192.168.1.113:1205/ws");

    socket.onopen = () => {
        socket.send(
            JSON.stringify({ type: "", data: { x: startingPos.x, y: startingPos.y, color: color } })
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
        if (keys[event.key]) {
            return;
        }
        keys[event.key] = true;
    });
    document.addEventListener("keyup", (event) => {
        keys[event.key] = false;
    });
    window.addEventListener("blur", () => {
        for (const key in keys) {
            keys[key] = false;
        }
    });

    const fps = 20;
    const interval = 1000 / fps;
    let lastFrameTime = 0;
    /**
     * @param {number} timestamp
     */
    function gameLoop(timestamp) {
        const elapsed = timestamp - lastFrameTime;

        if (!userId || !playerState || !color) {
            canvasCtx.font = "50px Arial";
            canvasCtx.fillText("Loading...", canvas.width / 2, canvas.height / 2);
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
            let playerHeight = playerFrame.blueWalkLeft[data.frame].height;
            let playerWidth = playerFrame.blueWalkLeft[data.frame].width;
            if (color === "pink") {
                playerHeight = playerFrame.pinkWalkLeft[data.frame].height;
                playerWidth = playerFrame.pinkWalkLeft[data.frame].width;
            }

            if (keys.w && data.y > 0) {
                data.y -= 10;
            }
            if (keys.a && data.x > 0) {
                data.x -= 10;
            }
            if (keys.s && data.y + playerHeight < canvas.height) {
                data.y += 10;
            }
            if (keys.d && data.x + playerWidth + 10 < canvas.width) {
                data.x += 10;
            }
            if (!(keys.a && keys.d)) {
                if (keys.a) {
                    data.facing = "left";
                } else if (keys.d) {
                    data.facing = "right";
                }
            }

            let xTranslate = clientWidth / 2 - playerWidth / 2 - data.x;
            let yTranslate = clientHeight / 2 - playerHeight / 2 - data.y;
            if (xTranslate > 300) {
                xTranslate = 300;
            } else if (xTranslate < -800) {
                xTranslate = 800;
            }
            if (yTranslate > 100) {
                yTranslate = 100;
            } else if (yTranslate < -500) {
                yTranslate = -500;
            }
            canvas.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;

            lastFrameTime = timestamp - (elapsed % interval);
            const walking = movementKeys.some((key) => keys[key]);
            if (walking) {
                if (data.changeFrame) {
                    data.frame += 1;
                    data.changeFrame = false;
                } else {
                    data.changeFrame = true;
                }
                if (data.frame > 2) {
                    data.frame = 0;
                }
                if (keys.a && keys.d && !(keys.w || keys.s)) {
                    data.frame = 0;
                }
                renderGame(playerState, canvas, canvasCtx, playerFrame);
            } else {
                data.frame = 0;
                renderGame(playerState, canvas, canvasCtx, playerFrame);
            }

            socket.send(JSON.stringify({ type: "move", data: data }));
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
 */
function renderGame(playerState, canvas, context, playerFrame) {
    context.clearRect(0, 0, canvas.width, canvas.height);

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
        context.drawImage(walkingFrame[state.frame], state.x, state.y);
    }

    for (const player in playerState) {
        if (player === userId) {
            continue;
        }
        renderPlayer(player);
    }

    renderPlayer(userId);
}
