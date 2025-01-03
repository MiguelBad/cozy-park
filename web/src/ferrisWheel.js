/**
 * @param {FerrisState} ferrisState
 * @param {HTMLDivElement} menu
 * @param {WebSocket} socket
 */
function handleFerrisWheelClick(ferrisState, menu, socket) {
    const max = 2;
    if (ferrisState.players.length === max) {
        return;
    }

    if (ferrisState.players.some((p) => p === Player.userId)) {
        return;
    }

    const initialFerrisLoading = document.getElementById("ferris-wheel-menu--loading");
    if (!(initialFerrisLoading instanceof HTMLParagraphElement)) {
        throw new Error("failed to find cancel on ferris wheel menu");
    }
    const loading = initialFerrisLoading;

    menu.style.display = "flex";
    loading.textContent = `Waiting for (${ferrisState.players.length + 1}/${max}) players...`;

    socket.send(
        JSON.stringify({ type: "ferris", data: { action: "join", player: Player.userId } })
    );
}

/**
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {Asset} asset
 * @param {Pos} pos
 * @param {Dimension} area
 * @param {FerrisState} ferrisState
 */
function renderFerrisWheel(gameCtx, asset, pos, area, ferrisState) {
    if (ferrisState.players.length < 2) {
        if (ferrisState.frame > 2) {
            renderGame(gameCtx, asset.ferrisEmpty[ferrisState.frame - 3], pos, area);
        } else {
            renderGame(gameCtx, asset.ferrisEmpty[ferrisState.frame], pos, area);
        }
    } else {
        renderGame(gameCtx, asset.ferris[ferrisState.frame], pos, area);
    }
}

/**
 * @param {HTMLDivElement} menu
 * @param {WebSocket} socket
 */
function handleFerrisCancel(menu, socket) {
    menu.style.display = "none";
    socket.send(
        JSON.stringify({ type: "ferris", data: { action: "cancel", player: Player.userId } })
    );
}

/**
 * @param {FerrisState} ferrisState
 * @param {HTMLParagraphElement} exit
 * @param {WebSocket} socket
 * @param {State} playerClientState
 * @param {PlayerState} playerState
 */
function handleFerriExit(ferrisState, exit, socket, playerClientState, playerState) {
    exit.style.display = "none";
    socket.send(
        JSON.stringify({ type: "ferris", data: { action: "exit", player: Player.userId } })
    );
    for (const player of ferrisState.players) {
        if (player !== Player.userId) {
            playerState[player].action = "idle";
        } else {
            playerClientState.action = "idle";
        }
    }

    ferrisState.players = [];
}

/**
 * @param {FerrisState} ferrisState
 * @returns {boolean}
 */
function inFerris(ferrisState) {
    return ferrisState.players.length === 2 && ferrisState.players.some((p) => p === Player.userId);
}
