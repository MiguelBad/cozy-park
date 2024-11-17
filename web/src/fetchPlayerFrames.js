/**
 * @returns {{blueWalkLeft: HTMLImageElement[], blueWalkRight: HTMLImageElement[], pinkWalkLeft: HTMLImageElement[], pinkWalkRight: HTMLImageElement[]}}
 */
function fetchPlayerFrames() {
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

    /**
     * @param {string[]} frames
     * @param {HTMLImageElement[]} target
     */
    function preloadImages(frames, target) {
        for (const frame of frames) {
            const image = new Image();
            target.push(image);
            image.src = frame;
        }
    }

    preloadImages(walkFrame.blueWalkLeft, preloaded.blueWalkLeft);
    preloadImages(walkFrame.blueWalkRight, preloaded.blueWalkRight);
    preloadImages(walkFrame.pinkWalkLeft, preloaded.pinkWalkLeft);
    preloadImages(walkFrame.pinkWalkRight, preloaded.pinkWalkRight);

    return preloaded;
}
