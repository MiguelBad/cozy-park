/**
 * @returns {Promise<{blueWalkLeft: HTMLImageElement[], blueWalkRight: HTMLImageElement[], pinkWalkLeft: HTMLImageElement[], pinkWalkRight: HTMLImageElement[]}>}
 */
async function fetchPlayerFrames() {
    const walkFrame = {
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
    };

    /**
     * @type {{blueWalkLeft: HTMLImageElement[], blueWalkRight: HTMLImageElement[], pinkWalkLeft: HTMLImageElement[], pinkWalkRight: HTMLImageElement[]}}
     */
    const preloaded = {
        blueWalkLeft: [],
        blueWalkRight: [],
        pinkWalkLeft: [],
        pinkWalkRight: [],
    };

    await preloadImages(walkFrame.blueWalkLeft, preloaded.blueWalkLeft);
    await preloadImages(walkFrame.blueWalkRight, preloaded.blueWalkRight);
    await preloadImages(walkFrame.pinkWalkLeft, preloaded.pinkWalkLeft);
    await preloadImages(walkFrame.pinkWalkRight, preloaded.pinkWalkRight);

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
