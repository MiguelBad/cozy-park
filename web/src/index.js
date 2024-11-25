/**
 * @typedef {{
 * blueWalkLeft: HTMLImageElement[],
 * blueWalkRight: HTMLImageElement[],
 * pinkWalkLeft: HTMLImageElement[],
 * pinkWalkRight: HTMLImageElement[],
 * diningEmpty: HTMLImageElement[],
 * diningBlue: HTMLImageElement[],
 * diningPink: HTMLImageElement[],
 * diningBluePink: HTMLImageElement[],
 * diningPinkBlue: HTMLImageElement[],
 * background: HTMLImageElement[]
 * ferrisEmpty: HTMLImageElement[],
 * ferris: HTMLImageElement[],
 *}} Asset
 * @typedef {{ color: string, action: string, target: string, x: number, y: number, frame: number, changeFrame: boolean, facing: string}} State
 * @typedef { Object<string, State>} PlayerState
 * @typedef {{x: number, y: number, facing: string, frame: number, changeFrame: boolean, action: string}} Data
 * @typedef {{x: number, y: number, w: number, h: number}} Dimension
 * @typedef {{x: number, y: number}} Pos
 */

const Player = { userId: "", color: "" };
const GameConfig = {
    canvasWidth: 2496,
    canvasHeight: 2496 * (3 / 5),
    startingPos: { x: 2200, y: 1300 },
    playerHeight: 64,
    playerWidth: 64,
};

window.addEventListener(
    "wheel",
    (event) => {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    },
    { passive: false }
);
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

document.addEventListener("DOMContentLoaded", async function () {
    const fetchLoad = document.getElementById("fetch-load");
    if (!(fetchLoad instanceof HTMLParagraphElement)) {
        throw new Error("cannot find fetch load element");
    }

    const asset = await fetchAsset();
    fetchLoad.hidden = true;

    playerSelect()
        .then((selected) => {
            Player.color = selected;
            main(asset);
        })
        .catch(() => {
            console.error("failed to select player");
        });
});

/**
 * @param {Asset} asset
 */
function main(asset) {
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
        if (clientHeight > GameConfig.canvasHeight) {
            clientHeight = GameConfig.canvasHeight;
        }
        if (clientWidth > 1920) {
            clientWidth = 1920;
        }
        if (clientWidth > GameConfig.canvasWidth) {
            clientWidth = GameConfig.canvasWidth;
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

    const initialPlayerCtx = playerCanvas.getContext("2d");
    if (!(initialPlayerCtx instanceof CanvasRenderingContext2D)) {
        throw new Error("failed to create canvas context");
    }
    const playerCtx = initialPlayerCtx;

    const socket = new WebSocket("ws://localhost:1205/ws");

    const Area = {
        Dining: { x: 0, y: 992, w: 727, h: 504 },
        FerrisWheel: { x: 0, y: 0, w: 762, h: 736 },
        Lake: { x: 1257, y: 0, w: 867, h: 314 },
    };
    const ObjectPos = {
        DiningTable: { x: 404, y: 1309 },
        FerrisWheel: { x: 250, y: 77 },
    };

    socket.onopen = () => {
        socket.send(
            JSON.stringify({
                type: "player",
                data: {
                    color: Player.color,
                    x: GameConfig.startingPos.x,
                    y: GameConfig.startingPos.y,
                    facing: "left",
                },
            })
        );
    };

    /**
     * @type {PlayerState}
     */
    const playerState = {};
    const diningState = { left: "", right: "" };
    const ferrisState = { current: 0, cycle: 0, players: 0 };
    socket.onmessage = (event) => {
        const serverMessage = JSON.parse(event.data);
        switch (serverMessage.type) {
            case "playerState":
                playerState[serverMessage.id] = serverMessage.state;
                break;
            case "connected":
                Player.userId = serverMessage.id;
                break;
            case "disconnected":
                const disconnectedP = serverMessage.id;
                delete playerState[disconnectedP];
                break;
            case "diningState":
                diningState.left = serverMessage.left;
                diningState.right = serverMessage.right;
                renderDining(gameCtx, asset, ObjectPos.DiningTable, Area.Dining, diningState);
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

    /**
     * @type {Data}
     */
    const data = {
        x: 0,
        y: 0,
        facing: "",
        frame: 0,
        changeFrame: false,
        action: "",
    };
    let xTranslate = 0;
    let yTranslate = 0;

    gameCanvas.addEventListener("click", (event) => {
        const click = {
            x: event.offsetX,
            y: event.offsetY,
        };

        if (isWithinArea(data, Area.Dining)) {
            handleDiningClick(
                gameCtx,
                asset,
                click,
                data,
                ObjectPos.DiningTable,
                Area.Dining,
                socket,
                diningState
            );
        } else if (isWithinArea(data, Area.FerrisWheel)) {
        } else if (isWithinArea(data, Area.Lake)) {
        }
    });

    renderDining(gameCtx, asset, ObjectPos.DiningTable, Area.Dining, diningState);

    const fps = 20;
    const interval = 1000 / fps;
    let lastFrameTime = 0;
    let moveVal = 10;
    /**
     * @param {number} timestamp
     */
    function gameLoop(timestamp) {
        const elapsed = timestamp - lastFrameTime;

        if (!Player.userId || !playerState || !Player.color) {
            playerCtx.font = "50px Arial";
            playerCtx.fillText(
                "Loading...",
                GameConfig.canvasWidth / 2,
                GameConfig.canvasHeight / 2
            );
            requestAnimationFrame(gameLoop);
            return;
        }

        data.x = playerState[Player.userId].x;
        data.y = playerState[Player.userId].y;
        data.facing = playerState[Player.userId].facing;
        data.frame = playerState[Player.userId].frame;
        data.changeFrame = playerState[Player.userId].changeFrame;
        data.action = playerState[Player.userId].action;

        if (elapsed > interval) {
            if (keys.w && validMove(data.x, data.y - moveVal)) {
                data.y -= moveVal;
            }
            if (keys.a && validMove(data.x - moveVal, data.y)) {
                data.x -= moveVal;
            }
            if (keys.s && validMove(data.x, data.y + moveVal)) {
                data.y += moveVal;
            }
            if (keys.d && validMove(data.x + moveVal, data.y)) {
                data.x += moveVal;
            }
            if (!(keys.a && keys.d)) {
                if (keys.a) {
                    data.facing = "left";
                } else if (keys.d) {
                    data.facing = "right";
                }
            }

            xTranslate = clientWidth / 2 - GameConfig.playerWidth / 2 - data.x;
            yTranslate = clientHeight / 2 - GameConfig.playerHeight / 2 - data.y;
            playerCanvas.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;
            gameCanvas.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;
            canvasBackground.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;

            lastFrameTime = timestamp - (elapsed % interval);
            const walking = movementKeys.some((key) => keys[key]);
            if (walking) {
                data.action = "move";
                if (diningState.left === Player.color) {
                    diningState.left = "";
                    socket.send(JSON.stringify({ type: "dining", data: diningState }));
                    renderDining(gameCtx, asset, ObjectPos.DiningTable, Area.Dining, diningState);
                } else if (diningState.right === Player.color) {
                    diningState.right = "";
                    socket.send(JSON.stringify({ type: "dining", data: diningState }));
                    renderDining(gameCtx, asset, ObjectPos.DiningTable, Area.Dining, diningState);
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
            }

            handleFerrisWheel(gameCtx, asset, Area.FerrisWheel, ferrisState, ObjectPos.FerrisWheel);
            renderPlayer(playerState, playerCtx, asset);
            socket.send(JSON.stringify({ type: "player", data: data }));
        }
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}

/**
 * @param {PlayerState} playerState
 * @param {CanvasRenderingContext2D} playerCtx
 * @param {Asset} asset
 */
function renderPlayer(playerState, playerCtx, asset) {
    playerCtx.clearRect(0, 0, GameConfig.canvasWidth, GameConfig.canvasHeight);

    /**
     * @param {string} player
     */
    function renderPlayerHelper(player) {
        const state = playerState[player];

        let walkingFrame = asset.pinkWalkRight;
        if (playerState[player].color === "blue") {
            walkingFrame = asset.blueWalkRight;
        }
        if (playerState[player].facing === "left") {
            walkingFrame = asset.pinkWalkLeft;
            if (playerState[player].color === "blue") {
                walkingFrame = asset.blueWalkLeft;
            }
        }
        playerCtx.drawImage(walkingFrame[state.frame], state.x, state.y);
    }

    for (const player in playerState) {
        if (player === Player.userId) {
            continue;
        }
        if (playerState[player].action !== "interacting") {
            renderPlayerHelper(player);
        }
    }
    if (playerState[Player.userId].action !== "interacting") {
        renderPlayerHelper(Player.userId);
    }
}

/**
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {HTMLImageElement} frame
 * @param {Pos} pos
 * @param {Dimension} area
 */
function renderGame(gameCtx, frame, pos, area) {
    gameCtx.clearRect(area.x, area.y, area.w, area.h);
    gameCtx.drawImage(frame, pos.x, pos.y);
}

/**
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {Asset} asset
 * @param {Dimension} area
 * @param {{ current: number, cycle: number, players: number }} state
 * @param {Pos} pos
}
 */
function handleFerrisWheel(gameCtx, asset, area, state, pos) {
    if (state.players === 0) {
        if (state.cycle < 10) {
            state.cycle++;
        } else {
            state.cycle = 0;
            if (state.current < 2) {
                state.current++;
            } else {
                state.current = 0;
            }
            renderGame(gameCtx, asset.ferrisEmpty[state.current], pos, area);
        }
    }
}

/**
 * @param {Pos} pos
 * @param {Dimension} area
 * @returns {boolean}
 */
function isWithinArea(pos, area) {
    if (
        ((pos.x > area.x && pos.x < area.w + area.x) ||
            (pos.x + d > area.x && pos.x + d < area.w + area.x)) &&
        ((pos.y > area.y && pos.y < area.h + area.y) ||
            (pos.y + d > area.y && pos.y + d < area.h + area.y))
    ) {
        return true;
    }

    return false;
}
