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
    }
}

function handleBenchClick() {}
