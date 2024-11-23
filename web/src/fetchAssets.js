/**
 * @returns {Promise<{
 * blueWalkLeft: HTMLImageElement[],
 * blueWalkRight: HTMLImageElement[],
 * pinkWalkLeft: HTMLImageElement[],
 * pinkWalkRight: HTMLImageElement[],
 * dining: HTMLImageElement[],
 * background: HTMLImageElement[]
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
        dining: [
            "assets/dining/dining-empty.png",
            "assets/dining/dining-resto.png",
            "assets/dining/dining-blue-left.png",
            "assets/dining/dining-blue-right.png",
            "assets/dining/dining-pink-left.png",
            "assets/dining/dining-pink-right.png",
            "assets/dining/dining-blue-pink.png",
            "assets/dining/dining-pink-blue.png",
        ],
        background: ["assets/bg/canvas-bg.png"],
    };

    /**
     * @type {{
     * blueWalkLeft: HTMLImageElement[],
     * blueWalkRight: HTMLImageElement[],
     * pinkWalkLeft: HTMLImageElement[],
     * pinkWalkRight: HTMLImageElement[],
     * dining: HTMLImageElement[],
     * background: HTMLImageElement[]
     * }}
     */
    const preloaded = {
        blueWalkLeft: [],
        blueWalkRight: [],
        pinkWalkLeft: [],
        pinkWalkRight: [],
        dining: [],
        background: [],
    };

    await preloadImages(path.blueWalkLeft, preloaded.blueWalkLeft);
    await preloadImages(path.blueWalkRight, preloaded.blueWalkRight);
    await preloadImages(path.pinkWalkLeft, preloaded.pinkWalkLeft);
    await preloadImages(path.pinkWalkRight, preloaded.pinkWalkRight);
    await preloadImages(path.dining, preloaded.dining);
    await preloadImages(path.background, preloaded.background);

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
