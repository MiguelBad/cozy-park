/**
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {Asset} asset
 * @param {Pos} pos
 * @param {Dimension} area1
 * @param {Dimension} area2
 * @param {{frame: number, cycle: number}} waveState
 */
function renderWaves(gameCtx, asset, pos, area1, area2, waveState) {
    if (waveState.cycle < 20) {
        waveState.cycle++;
        return;
    } else {
        waveState.cycle = 0;
    }
    waveState.frame++;
    if (waveState.frame > asset.lakeWaves.length - 1) {
        waveState.frame = 0;
    }
    renderGame(gameCtx, asset.lakeWaves[waveState.frame], pos, area1);
    renderGame(gameCtx, asset.lakeWaves[waveState.frame], pos, area2);
}

/**
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {Asset} asset
 * @param {Pos} pos
 * @param {Dimension} area
 * @param {{left: string, right: string}} benchState
 */
function renderBench(gameCtx, asset, pos, area, benchState) {
    if (!benchState.left && !benchState.right) {
        renderGame(gameCtx, asset.benchEmpty[0], pos, area);
    } else if (!benchState.left) {
        renderGame(gameCtx, asset.benchPink[0], pos, area);
    } else if (!benchState.right) {
        renderGame(gameCtx, asset.benchBlue[0], pos, area);
    } else {
        renderGame(gameCtx, asset.bencheBluePink[0], pos, area);
    }
}

/**
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {Asset} asset
 * @param {Pos} pos
 * @param {Dimension} area
 * @param {WebSocket} socket
 * @param {{left: string, right: string}} benchState
 * @param {Pos} click
 * @param {Data} data
 */
function handleBenchClick(gameCtx, asset, pos, area, benchState, socket, click, data) {
    const bench = { x: pos.x, y: pos.y, w: 160, h: 90 };
    if (!(isWithinArea(click, bench) && isWithinArea({ x: data.x, y: data.y }, bench))) {
        return;
    }
    if (benchState.left !== "blue" && Player.color === "blue") {
        benchState.left = "blue";
        socket.send(JSON.stringify({ type: "bench", data: benchState }));

        data.action = "bench";
        socket.send(JSON.stringify({ type: "player", data: data }));
        renderBench(gameCtx, asset, pos, area, benchState);
    }
    if (benchState.right !== "pink" && Player.color === "pink") {
        benchState.right = "pink";
        socket.send(JSON.stringify({ type: "bench", data: benchState }));

        data.action = "bench";
        socket.send(JSON.stringify({ type: "player", data: data }));
        renderBench(gameCtx, asset, pos, area, benchState);
    }
}

/**
 * @param {{left: string, right: string}} benchState
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {Asset} asset
 * @param {Pos} pos
 * @param {Dimension} area
 * @param {WebSocket} socket
 */
function handleBenchMove(gameCtx, asset, pos, area, benchState, socket) {
    if (benchState.left === Player.color) {
        benchState.left = "";
        socket.send(JSON.stringify({ type: "bench", data: benchState }));
        renderBench(gameCtx, asset, pos, area, benchState);
    } else if (benchState.right === Player.color) {
        benchState.right = "";
        socket.send(JSON.stringify({ type: "bench", data: benchState }));
        renderBench(gameCtx, asset, pos, area, benchState);
    }
}

/**
 * @param {CanvasRenderingContext2D} fireworksCtx
 * @param {Asset} asset
 * @param {Pos} pos
 * @param {Dimension} area
 * @param {{frame: number, sizeMultiplier: number, cycle: number, nextWait: number}} fireworksState
 */
function renderFireworks(fireworksCtx, asset, pos, area, fireworksState) {
    if (fireworksState.nextWait < 4) {
        fireworksState.nextWait++;
        return;
    }

    if (fireworksState.cycle < 2) {
        fireworksState.cycle++;
        return;
    } else {
        fireworksState.cycle = 0;
    }

    fireworksState.frame++;
    if (fireworksState.frame >= 5) {
        fireworksState.frame = 0;
        fireworksState.nextWait = 0;
    }

    fireworksCtx.clearRect(area.x, area.y, area.w, area.h);
    fireworksCtx.drawImage(asset.fireworks[fireworksState.frame], pos.x, pos.y);
}
