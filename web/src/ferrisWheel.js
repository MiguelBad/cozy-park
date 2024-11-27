/**
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {Asset} asset
 * @param {Pos} pos
 * @param {Dimension} area
 * @param {FerrisState} ferrisState
 * @param {HTMLDivElement} menu
 */
function handleFerrisWheelClick(gameCtx, asset, pos, area, ferrisState, menu) {
    const initialFerrisLoading = document.getElementById("ferris-wheel-menu--loading");
    if (!(initialFerrisLoading instanceof HTMLParagraphElement)) {
        throw new Error("failed to find cancel on ferris wheel menu");
    }
    const ferrisLoading = initialFerrisLoading;

    menu.style.display = "flex";
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
    }
}

/**
 * @param {FerrisState} ferrisState
 * @param {HTMLDivElement} menu
 */
function handleFerrisCancel(ferrisState, menu) {
    menu.style.display = "none";
}
