let modelSelectorOpen = false;
const modelSelectorButton = document.getElementById("model-selector-button");
const modelSelectorContainer = document.getElementById("model-selector-container");

async function renderModels() {
    const models = await getModels();
    modelSelectorContainer.innerHTML = "";

    if (!models || models.length === 0 || typeof(models) === "string") {
        const message = document.createElement("div");
        if (typeof(models) === "string") {
            message.textContent = models;
        } else {
            message.textContent = "You don't have any models";
        }
        message.style.padding = "5px 10px";
        modelSelectorContainer.appendChild(message);
        return;
    }

    const savedModel = localStorage.getItem("selectedModel") || "Unknown";

    models.forEach(model => {
        const btn = document.createElement("button");
        btn.className = "button" + (model === savedModel ? " active" : "");
        const span = document.createElement("span");
        span.className = "model-name";
        span.textContent = model;
        btn.appendChild(span);
        btn.addEventListener("click", () => {
            modelSelectorButton.querySelector(".model-name").textContent = model;
            modelSelectorContainer.querySelectorAll(".button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            localStorage.setItem("selectedModel", model);
            modelSelectorContainer.style.display = "none";
            modelSelectorOpen = false;
        });
        modelSelectorContainer.appendChild(btn);
    });

    modelSelectorButton.querySelector(".model-name").textContent = savedModel;
}

modelSelectorButton.addEventListener("click", () => {
    modelSelectorOpen = !modelSelectorOpen;
    modelSelectorContainer.style.display = modelSelectorOpen ? "flex" : "none";
    if (modelSelectorOpen) renderModels();
});

document.addEventListener("click", e => {
    if (!modelSelectorContainer.contains(e.target) && !modelSelectorButton.contains(e.target)) {
        modelSelectorContainer.style.display = "none";
        modelSelectorOpen = false;
    }
});

renderModels();
