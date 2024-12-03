function login() {
    return new Promise((resolve) => {
        const loginContainer = document.getElementById("login--container");
        if (!(loginContainer instanceof HTMLDivElement)) {
            throw new Error("failed to get login container div");
        }
        loginContainer.style.display = "flex";

        const loginInput = document.getElementById("login--input");
        if (!(loginInput instanceof HTMLInputElement)) {
            throw new Error("failed to get login input");
        }
        const loginSubmit = document.getElementById("login--submit");
        if (!(loginSubmit instanceof HTMLButtonElement)) {
            throw new Error("failed to get login submit button");
        }

        loginSubmit.addEventListener("click", async () => {
            const val = loginInput.value;

            try {
                const response = await fetch("http://happy5thanniversary.win/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: val }),
                });
                if (!response.ok) {
                    throw new Error(`http error: ${response.status}`);
                }

                /**
                 * @type {{status: boolean}}
                 */
                const data = await response.json();
                if (data.status) {
                    loginContainer.style.display = "none";
                    resolve("valid");
                }
            } catch (err) {
                console.error("failed to send http post request", err);
            }
        });
    });
}
