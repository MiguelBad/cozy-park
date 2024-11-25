/**
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {Asset} asset
 * @param {Pos} click
 * @param {Data} data
 * @param {Pos} tablePos
 * @param {Dimension} area
 * @param {WebSocket} socket
 * @param {{left: string, right: string}} diningState
 */
function handleDiningClick(gameCtx, asset, click, data, tablePos, area, socket, diningState) {
    const Chair = {
        left: { x: 398, y: 1325, w: 79, h: 78 },
        right: { x: 595, y: 1325, w: 79, h: 78 },
    };
    if (isWithinArea(click, Chair.left) && isWithinArea({ x: data.x, y: data.y }, Chair.left)) {
        if (diningState.left) {
            return;
        }
        data.action = "interacting";
        diningState.left = Player.color;
        socket.send(JSON.stringify({ type: "player", data: data }));
        socket.send(JSON.stringify({ type: "dining", data: diningState }));
        renderDining(gameCtx, asset, tablePos, area, diningState);
    } else if (
        isWithinArea(click, Chair.right) &&
        isWithinArea({ x: data.x, y: data.y }, Chair.right)
    ) {
        if (diningState.right) {
            return;
        }
        data.action = "interacting";
        diningState.right = Player.color;
        socket.send(JSON.stringify({ type: "player", data: data }));
        socket.send(JSON.stringify({ type: "dining", data: diningState }));
        renderDining(gameCtx, asset, tablePos, area, diningState);
    }
}

/**
 * @param {CanvasRenderingContext2D} gameCtx
 * @param {Asset} asset
 * @param {Pos} tablePos
 * @param {Dimension} area
 * @param {{left: string, right: string}} diningState
 */
function renderDining(gameCtx, asset, tablePos, area, diningState) {
    let frame = asset.diningEmpty[0];
    if (diningState.left && diningState.right) {
        if (diningState.left === "pink") {
            frame = asset.diningPinkBlue[0];
        } else {
            frame = asset.diningBluePink[0];
        }
    } else if (diningState.left) {
        if (diningState.left === "pink") {
            frame = asset.diningPink[0];
        } else {
            frame = asset.diningBlue[0];
        }
    } else if (diningState.right) {
        if (diningState.right === "pink") {
            frame = asset.diningPink[1];
        } else {
            frame = asset.diningBlue[1];
        }
    }

    renderGame(gameCtx, frame, tablePos, area);
}
