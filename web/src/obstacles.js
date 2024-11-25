const d = 64; // player dimension 64x64
const obstacles = [
    { x: 0, y: 0, w: 205, h: 430 },
    { x: 0, y: 430, w: 399, h: 562 },
    { x: 205, y: 0, w: 557, h: 77 },
    { x: 762, y: 0, w: 384, h: 406 },
    { x: 762, y: 406, w: 360, h: 236 },
    { x: 762, y: 642, w: 313, h: 94 },
    { x: 527, y: 406, w: 235, h: 330 },
    { x: 506, y: 885, w: 221, h: 353 },
    { x: 727, y: 885, w: 419, h: 615 },
    { x: 1250, y: 0, w: 874, h: 91 },
    { x: 2124, y: 0, w: 376, h: 314 },
    { x: 1257, y: 206, w: 553, h: 419 },
    { x: 1810, y: 285, w: 229, h: 340 },
    { x: 2039, y: 314, w: 461, h: 879 },
    { x: 1339, y: 625, w: 700, h: 276 },
    { x: 1262, y: 1023, w: 29, h: 100 },
    { x: 1291, y: 907, w: 48, h: 316 },
    { x: 1339, y: 901, w: 700, h: 374 },

    // dining area
    { x: 153, y: 1084, w: 57, h: 15 },
    { x: 110, y: 1099, w: 140, h: 23 },
    { x: 80, y: 1122, w: 212, h: 23 },
    { x: 60, y: 1145, w: 240, h: 85 },
    { x: 73, y: 1230, w: 214, h: 173 },
    { x: 465, y: 1329, w: 130, h: 67 },

    // ferris wheel area
    { x: 205, y: 77, w: 557, h: 353 },
];
// { x: 0, y: 0, w: 0, h: 0 },

/**
 * @param{number} x
 * @param{number} y
 * @return {boolean}
 */
function validMove(x, y) {
    if (y < 20 || y + d > GameConfig.canvasHeight - 20) {
        return false;
    }

    if (x < 20 || x + d > GameConfig.canvasWidth - 20) {
        return false;
    }

    for (const obstacle of obstacles) {
        if (
            ((x > obstacle.x && x < obstacle.w + obstacle.x) ||
                (x + d > obstacle.x && x + d < obstacle.w + obstacle.x)) &&
            ((y > obstacle.y && y < obstacle.h + obstacle.y) ||
                (y + d > obstacle.y && y + d < obstacle.h + obstacle.y))
        ) {
            return false;
        }
    }

    return true;
}
