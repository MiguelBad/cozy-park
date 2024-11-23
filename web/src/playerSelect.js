function playerSelect() {
    return new Promise((resolve) => {
        const playerSelectMenu = document.getElementById("player-select--container");
        if (!(playerSelectMenu instanceof HTMLDivElement)) {
            throw new Error("did not found player select menu");
        }
        playerSelectMenu.hidden = false;

        const blueOption = document.getElementById("player-select--blue");
        if (!(blueOption instanceof HTMLDivElement)) {
            throw new Error("did not found blue option");
        }
        const pinkOption = document.getElementById("player-select--pink");
        if (!(pinkOption instanceof HTMLDivElement)) {
            throw new Error("did not found pink option");
        }

        blueOption.addEventListener("click", () => {
            playerSelectMenu.style.display = "none";
            playerSelectMenu.hidden = true;
            resolve("blue");
        });

        pinkOption.addEventListener("click", () => {
            playerSelectMenu.style.display = "none";
            playerSelectMenu.hidden = true;
            resolve("pink");
        });
    });
}
