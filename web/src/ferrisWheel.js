/**
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {Asset} asset
 * @param {Pos} pos
 * @param {Dimension} area
 * @param {FerrisState} ferrisState
 * @param {HTMLDivElement} menu
 * @param {WebSocket} socket
 */
function handleFerrisWheelClick(gameCtx, asset, pos, area, ferrisState, menu, socket) {
    const max = 2;
    if (ferrisState.players.length > max) {
        return;
    }

    if (ferrisState.players.some((p) => p === Player.userId)) {
        return;
    }

    if (ferrisState.players.length === max) {
        return socket.send(
            JSON.stringify({ type: "ferris", data: { didJoin: true, player: Player.userId } })
        );
    }

    const initialFerrisLoading = document.getElementById("ferris-wheel-menu--loading");
    if (!(initialFerrisLoading instanceof HTMLParagraphElement)) {
        throw new Error("failed to find cancel on ferris wheel menu");
    }
    const loading = initialFerrisLoading;

    menu.style.display = "flex";
    loading.textContent = `Waiting for (${ferrisState.players.length + 1}/${max}) players...`;

    socket.send(JSON.stringify({ type: "ferris", data: { didJoin: true, player: Player.userId } }));
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
        renderGame(gameCtx, asset.ferrisEmpty[ferrisState.frame], pos, area);
    } else {
        renderGame(gameCtx, asset.ferris[ferrisState.frame], pos, area);
    }
}

/**
 * @param {FerrisState} ferrisState
 * @param {HTMLDivElement} menu
 * @param {WebSocket} socket
 */
function handleFerrisCancel(ferrisState, menu, socket) {
    menu.style.display = "none";
    socket.send(
        JSON.stringify({ type: "ferris", data: { didJoin: false, player: Player.userId } })
    );
}
