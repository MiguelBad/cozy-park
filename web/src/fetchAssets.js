/**
 * @returns {Promise<{
 * blueWalkLeft: HTMLImageElement[],
 * blueWalkRight: HTMLImageElement[],
 * pinkWalkLeft: HTMLImageElement[],
 * pinkWalkRight: HTMLImageElement[],
 * diningEmpty: HTMLImageElement[],
 * diningBlue: HTMLImageElement[],
 * diningPink: HTMLImageElement[],
 * diningBluePink: HTMLImageElement[],
 * diningPinkBlue: HTMLImageElement[],
 * background: HTMLImageElement[],
 * ferrisEmpty: HTMLImageElement[],
 * ferris: HTMLImageElement[],
 * ferrisMenu: HTMLImageElement[],
 * lakeWaves: HTMLImageElement[],
 * benchEmpty: HTMLImageElement[],
 * benchPink: HTMLImageElement[],
 * benchBlue: HTMLImageElement[],
 * bencheBluePink: HTMLImageElement[],
 * fireworks: HTMLImageElement[],
 * }>}
 */
async function fetchAsset() {
    const path = {
        blueWalkLeft: [
            "assets/frames/walk/blue-left-1st.png",
            "assets/frames/walk/blue-left-2nd.png",
            "assets/frames/walk/blue-left-3rd.png",
        ],
        blueWalkRight: [
            "assets/frames/walk/blue-right-1st.png",
            "assets/frames/walk/blue-right-2nd.png",
            "assets/frames/walk/blue-right-3rd.png",
        ],
        pinkWalkLeft: [
            "assets/frames/walk/pink-left-1st.png",
            "assets/frames/walk/pink-left-2nd.png",
            "assets/frames/walk/pink-left-3rd.png",
        ],
        pinkWalkRight: [
            "assets/frames/walk/pink-right-1st.png",
            "assets/frames/walk/pink-right-2nd.png",
            "assets/frames/walk/pink-right-3rd.png",
        ],
        diningEmpty: ["assets/dining/dining-empty.png"],
        diningBlue: ["assets/dining/dining-blue-left.png", "assets/dining/dining-blue-right.png"],
        diningPink: ["assets/dining/dining-pink-left.png", "assets/dining/dining-pink-right.png"],
        diningBluePink: ["assets/dining/dining-blue-pink.png"],
        diningPinkBlue: ["assets/dining/dining-pink-blue.png"],
        background: ["assets/bg/canvas-bg.png"],
        ferrisEmpty: [
            "assets/ferris-wheel/ferris-empty-1.png",
            "assets/ferris-wheel/ferris-empty-2.png",
            "assets/ferris-wheel/ferris-empty-3.png",
        ],
        ferris: [
            "assets/ferris-wheel/ferris-1.png",
            "assets/ferris-wheel/ferris-2.png",
            "assets/ferris-wheel/ferris-3.png",
            "assets/ferris-wheel/ferris-4.png",
            "assets/ferris-wheel/ferris-5.png",
            "assets/ferris-wheel/ferris-6.png",
        ],
        ferrisMenu: [
            "assets/ferris-wheel/ferris-exit.png",
            "assets/ferris-wheel/ferris-menu-background.png",
        ],
        lakeWaves: ["assets/lake/wave-1.png", "assets/lake/wave-2.png"],
        benchEmpty: ["assets/lake/bench-empty.png"],
        benchPink: ["assets/lake/bench-pink.png"],
        benchBlue: ["assets/lake/bench-blue.png"],
        bencheBluePink: ["assets/lake/bench-blue-pink.png"],
        fireworks: [
            "assets/fireworks/firework-0.png",
            "assets/fireworks/firework-1.png",
            "assets/fireworks/firework-2.png",
            "assets/fireworks/firework-3.png",
            "assets/fireworks/firework-4.png",
            "assets/fireworks/firework-5.png",
        ],
    };

    /**
     * @type {{
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
     * }}
     */
    const preloaded = {
        blueWalkLeft: [],
        blueWalkRight: [],
        pinkWalkLeft: [],
        pinkWalkRight: [],
        diningEmpty: [],
        diningBlue: [],
        diningPink: [],
        diningBluePink: [],
        diningPinkBlue: [],
        background: [],
        ferrisEmpty: [],
        ferris: [],
        ferrisMenu: [],
        lakeWaves: [],
        benchEmpty: [],
        benchPink: [],
        benchBlue: [],
        bencheBluePink: [],
        fireworks: [],
    };

    await preloadImages(path.blueWalkLeft, preloaded.blueWalkLeft);
    await preloadImages(path.blueWalkRight, preloaded.blueWalkRight);
    await preloadImages(path.pinkWalkLeft, preloaded.pinkWalkLeft);
    await preloadImages(path.pinkWalkRight, preloaded.pinkWalkRight);
    await preloadImages(path.diningEmpty, preloaded.diningEmpty);
    await preloadImages(path.diningBlue, preloaded.diningBlue);
    await preloadImages(path.diningPink, preloaded.diningPink);
    await preloadImages(path.diningBluePink, preloaded.diningBluePink);
    await preloadImages(path.diningPinkBlue, preloaded.diningPinkBlue);
    await preloadImages(path.background, preloaded.background);
    await preloadImages(path.ferrisEmpty, preloaded.ferrisEmpty);
    await preloadImages(path.ferris, preloaded.ferris);
    await preloadImages(path.ferrisMenu, preloaded.ferrisMenu);
    await preloadImages(path.lakeWaves, preloaded.lakeWaves);
    await preloadImages(path.benchEmpty, preloaded.benchEmpty);
    await preloadImages(path.benchBlue, preloaded.benchBlue);
    await preloadImages(path.benchPink, preloaded.benchPink);
    await preloadImages(path.bencheBluePink, preloaded.bencheBluePink);
    await preloadImages(path.fireworks, preloaded.fireworks);

    return preloaded;
}

/**
 * @param {string[]} frames
 * @param {HTMLImageElement[]} target
 */
function preloadImages(frames, target) {
    return Promise.all(
        frames.map((frame) => {
            return new Promise((resolve) => {
                const image = new Image();
                image.src = frame;
                image.onload = () => resolve(image);
                target.push(image);
            });
        })
    );
}
