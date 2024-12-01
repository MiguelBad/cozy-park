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
 * ferrisMenu: HTMLImageElement[],
 * lakeWaves: HTMLImageElement[],
 * benchEmpty: HTMLImageElement[],
 * benchPink: HTMLImageElement[],
 * benchBlue: HTMLImageElement[],
 * bencheBluePink: HTMLImageElement[],
 * fireworks: HTMLImageElement[],
 *}} Asset
 * @typedef {{ color: string, action: string, target: string, x: number, y: number, frame: number, changeFrame: boolean, facing: string}} State
 * @typedef { Object<string, State>} PlayerState
 * @typedef {{x: number, y: number, facing: string, frame: number, changeFrame: boolean, action: string}} Data
 * @typedef {{x: number, y: number, w: number, h: number}} Dimension
 * @typedef {{x: number, y: number}} Pos
 * @typedef {{ frame: number, players: string[] }} FerrisState
 */

const Player = { userId: "", color: "" };
const GameConfig = {
    canvasWidth: 2496,
    canvasHeight: 2496 * (3 / 5),
    startingPos: { x: 2200, y: 1300 },
    playerHeight: 64,
    playerWidth: 64,
    standardMoveVal: 15,
    offMovement: 0,
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
    canvasBackground.style.backgroundImage = "url(assets/bg/canvas-bg.png)";

    const initialPlayerCanvas = document.getElementById("player-canvas");
    if (!(initialPlayerCanvas instanceof HTMLCanvasElement)) {
        throw new Error("cannot find game canvas");
    }
    const playerCanvas = initialPlayerCanvas;
    const initialPlayerCtx = playerCanvas.getContext("2d");
    if (!(initialPlayerCtx instanceof CanvasRenderingContext2D)) {
        throw new Error("failed to create canvas context");
    }
    const playerCtx = initialPlayerCtx;

    const initialOtherPlayerCanvas = document.getElementById("other-player-canvas");
    if (!(initialOtherPlayerCanvas instanceof HTMLCanvasElement)) {
        throw new Error("cannot find game canvas");
    }
    const otherPlayerCanvas = initialOtherPlayerCanvas;
    const initialOtherPlayerCtx = otherPlayerCanvas.getContext("2d");
    if (!(initialOtherPlayerCtx instanceof CanvasRenderingContext2D)) {
        throw new Error("failed to create canvas context");
    }
    const otherPlayerCtx = initialOtherPlayerCtx;

    const initialGameCanvas = document.getElementById("game-canvas");
    if (!(initialGameCanvas instanceof HTMLCanvasElement)) {
        throw new Error("cannot find game canvas");
    }
    const gameCanvas = initialGameCanvas;
    const initialGameCtx = gameCanvas.getContext("2d");
    if (!(initialGameCtx instanceof CanvasRenderingContext2D)) {
        throw new Error("failed to create canvas context");
    }
    const gameCtx = initialGameCtx;

    const initialFireworkCanvas = document.getElementById("fireworks-canvas");
    if (!(initialFireworkCanvas instanceof HTMLCanvasElement)) {
        throw new Error("cannot find fireworks canvas");
    }
    const fireworksCanvas = initialFireworkCanvas;
    const initialFireworksCtx = fireworksCanvas.getContext("2d");
    if (!(initialFireworksCtx instanceof CanvasRenderingContext2D)) {
        throw new Error("failed to create fireworks canvas context");
    }
    const fireworksCtx = initialFireworksCtx;

    const initialFerrisMenu = document.getElementById("ferris-wheel-menu--container");
    if (!(initialFerrisMenu instanceof HTMLDivElement)) {
        throw new Error("failed to find ferris menu element");
    }
    const ferrisMenu = initialFerrisMenu;
    ferrisMenu.style.backgroundImage = "url(assets/ferris-wheel/ferris-menu-background.png)";

    const initialFerrisCancel = document.getElementById("ferris-wheel-menu--cancel");
    if (!(initialFerrisCancel instanceof HTMLParagraphElement)) {
        throw new Error("failed to find cancel on ferris wheel menu");
    }
    const ferrisCancel = initialFerrisCancel;

    const initialFerrisExit = document.getElementById("ferris-wheel--exit");
    if (!(initialFerrisExit instanceof HTMLParagraphElement)) {
        throw new Error("failed to find cancel on ferris wheel exit button");
    }
    const ferrisExit = initialFerrisExit;
    ferrisExit.style.backgroundImage = "url(assets/ferris-wheel/ferris-exit.png)";

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

    const Area = {
        Dining: { x: 0, y: 992, w: 727, h: 504 },
        FerrisWheel: { x: 0, y: 0, w: 762, h: 736 },
        Lake1: { x: 2156, y: 0, w: 344, h: 314 },
        Lake2: { x: 1744, y: 314, w: 756, h: 494 },
        Bench: { x: 1744, y: 0, w: 412, h: 314 },
        Firework: { x: 2124, y: 46, w: 340, h: 540 },
    };
    const ObjectPos = {
        DiningTable: { x: 404, y: 1309 },
        FerrisWheel: { x: 250, y: 77 },
        LakeWaves: { x: 1798, y: -38 },
        Bench: { x: 1900, y: 160 },
        Firework: { x: Area.Firework.x, y: Area.Firework.y },
    };

    const socket = new WebSocket("ws://192.168.1.105:1205/ws");
    /**
     * @type {PlayerState}
     */
    const playerState = {};
    socket.onopen = () => {
        const data = {
            color: Player.color,
            x: GameConfig.startingPos.x,
            y: GameConfig.startingPos.y,
            facing: "left",
            action: "idle",
        };
        playerState[Player.userId].color = data.color;
        playerState[Player.userId].x = data.x;
        playerState[Player.userId].y = data.y;
        playerState[Player.userId].facing = data.facing;
        playerState[Player.userId].action = data.action;
        socket.send(JSON.stringify({ type: "player", data: data }));
    };

    const diningState = { left: "", right: "" };
    /**
     * @type {FerrisState}
     */
    const ferrisState = { frame: 0, players: [] };
    const benchState = { left: "", right: "", showFireworks: false };
    socket.onmessage = (event) => {
        const serverMessage = JSON.parse(event.data);
        switch (serverMessage.type) {
            case "playerState":
                if (serverMessage.id != Player.userId) {
                    playerState[serverMessage.id] = serverMessage.state;
                }
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
            case "ferrisState":
                ferrisState.frame = serverMessage.frame;
                ferrisState.players = serverMessage.players;
                break;
            case "benchState":
                benchState.right = serverMessage.right;
                benchState.left = serverMessage.left;
                benchState.showFireworks = serverMessage.showFireworks;
                renderBench(gameCtx, asset, ObjectPos.Bench, Area.Bench, benchState);
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

    ferrisCancel.addEventListener("click", () => {
        handleFerrisCancel(ferrisMenu, socket);
    });
    ferrisExit.addEventListener("click", () => {
        handleFerriExit(ferrisState, ferrisExit, socket, playerState);
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
        action: "idle",
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
                diningState,
                socket
            );
        } else if (isWithinArea(data, Area.FerrisWheel)) {
            handleFerrisWheelClick(ferrisState, ferrisMenu, socket);
        } else if (isWithinArea(data, Area.Bench)) {
            handleBenchClick(
                gameCtx,
                asset,
                ObjectPos.Bench,
                Area.Bench,
                benchState,
                socket,
                click,
                data
            );
        }
    });

    renderDining(gameCtx, asset, ObjectPos.DiningTable, Area.Dining, diningState);
    renderBench(gameCtx, asset, ObjectPos.Bench, Area.Bench, benchState);

    const fps = 20;
    const interval = 1000 / fps;
    let lastFrameTime = 0;
    let moveVal = GameConfig.standardMoveVal;
    const waveState = { frame: 0, cycle: 0 };
    const fireworksState = { frame: -1, sizeMultiplier: 1, cycle: -1, nextWait: 0 };
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

        if (elapsed > interval) {
            data.x = playerState[Player.userId].x;
            data.y = playerState[Player.userId].y;
            data.facing = playerState[Player.userId].facing;
            data.frame = playerState[Player.userId].frame;
            data.changeFrame = playerState[Player.userId].changeFrame;
            data.action = playerState[Player.userId].action;

            if (inFerris(ferrisState)) {
                moveVal = GameConfig.offMovement;
            } else {
                moveVal = GameConfig.standardMoveVal;
            }

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
            if (inFerris(ferrisState)) {
                xTranslate = clientWidth / 2 - Area.FerrisWheel.w / 2 - Area.FerrisWheel.x;
                yTranslate = clientHeight / 2 - Area.FerrisWheel.h / 2 - Area.FerrisWheel.y;
            }
            playerCanvas.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;
            otherPlayerCanvas.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;
            gameCanvas.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;
            fireworksCanvas.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;
            canvasBackground.style.transform = `translate(${xTranslate}px, ${yTranslate}px)`;

            let walking = false;
            if (!inFerris(ferrisState)) {
                walking = movementKeys.some((key) => keys[key]);
            }
            if (walking) {
                data.action = "move";
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

                handleDiningMove(
                    gameCtx,
                    asset,
                    ObjectPos.DiningTable,
                    Area.Dining,
                    diningState,
                    socket
                );
                handleBenchMove(gameCtx, asset, ObjectPos.Bench, Area.Bench, benchState, socket);
            } else {
                data.frame = 0;
            }

            if (
                ferrisState.players.some((p) => p === Player.userId) &&
                !isWithinArea({ x: data.x, y: data.y }, Area.FerrisWheel)
            ) {
                handleFerrisCancel(ferrisMenu, socket);
            }
            ferrisExit.style.display = "none";
            if (inFerris(ferrisState)) {
                ferrisMenu.style.display = "none";
                ferrisExit.style.display = "flex";
            }

            if (benchState.showFireworks) {
                renderFireworks(
                    fireworksCtx,
                    asset,
                    ObjectPos.Firework,
                    Area.Firework,
                    fireworksState
                );
            }

            renderWaves(gameCtx, asset, ObjectPos.LakeWaves, Area.Lake1, Area.Lake2, waveState);
            renderFerrisWheel(gameCtx, asset, ObjectPos.FerrisWheel, Area.FerrisWheel, ferrisState);
            renderPlayer(playerState, playerCtx, otherPlayerCtx, asset);

            playerState[Player.userId].x = data.x;
            playerState[Player.userId].y = data.y;
            playerState[Player.userId].frame = data.frame;
            playerState[Player.userId].action = data.action;
            playerState[Player.userId].facing = data.facing;
            playerState[Player.userId].changeFrame = data.changeFrame;

            socket.send(JSON.stringify({ type: "player", data: data }));

            lastFrameTime = timestamp - (elapsed % interval);
        }
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}

/**
 * @param {PlayerState} playerState
 * @param {CanvasRenderingContext2D} playerCtx
 * @param {CanvasRenderingContext2D} otherPlayerCtx
 * @param {Asset} asset
 */
function renderPlayer(playerState, playerCtx, otherPlayerCtx, asset) {
    playerCtx.clearRect(0, 0, GameConfig.canvasWidth, GameConfig.canvasHeight);
    otherPlayerCtx.clearRect(0, 0, GameConfig.canvasWidth, GameConfig.canvasHeight);
    /**
     * @param {string} player
     * @param {CanvasRenderingContext2D} ctx
     */
    function renderPlayerHelper(player, ctx) {
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
        ctx.drawImage(walkingFrame[state.frame], state.x, state.y);
    }

    for (const player in playerState) {
        if (player === Player.userId) {
            continue;
        }
        if (playerState[player].action === "move" || playerState[player].action === "idle") {
            renderPlayerHelper(player, otherPlayerCtx);
        }
    }
    if (
        playerState[Player.userId].action === "move" ||
        playerState[Player.userId].action === "idle"
    ) {
        renderPlayerHelper(Player.userId, playerCtx);
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
