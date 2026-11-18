"use strict";

const pathButtons = Array.from(document.querySelectorAll("[data-path-id]"));
const progressCount = document.getElementById("progress-count");
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const progressMessage = document.getElementById("progress-message");
const resetButton = document.getElementById("reset-progress");
const themeButton = document.getElementById("theme-toggle");
const storageKey = "cyberlab-completed-paths";
const themes = ["green", "violet", "sunset"];
const validPathIds = new Set(pathButtons.map((button) => button.dataset.pathId));
let completedPaths = new Set();
let themeIndex = 0;

function showMessage(message) {
    progressMessage.textContent = message;
}

function renderProgress() {
    const completedCount = completedPaths.size;
    const totalCount = pathButtons.length;
    const percentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

    progressCount.textContent = `${completedCount} of ${totalCount} paths complete`;
    progressBar.setAttribute("aria-valuenow", String(completedCount));
    progressFill.style.width = `${percentage}%`;

    pathButtons.forEach((button) => {
        const isComplete = completedPaths.has(button.dataset.pathId);
        const card = button.closest(".card");

        button.setAttribute("aria-pressed", String(isComplete));
        button.querySelector(".button-label").textContent = isComplete ? "Completed" : "Mark complete";
        button.querySelector(".button-icon").textContent = isComplete ? "✓" : "+";
        card.classList.toggle("is-complete", isComplete);
    });
}

function saveProgress() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(completedPaths)));
        showMessage("Progress updated and saved in this browser.");
    } catch (error) {
        showMessage("Progress updated, but this browser could not save it. It may reset after you leave.");
    }
}

try {
    const savedProgress = localStorage.getItem(storageKey);

    if (savedProgress !== null) {
        const parsedProgress = JSON.parse(savedProgress);

        if (!Array.isArray(parsedProgress)) {
            throw new TypeError("Saved progress must be a list.");
        }

        completedPaths = new Set(parsedProgress.filter((pathId) => validPathIds.has(pathId)));
    }
} catch (error) {
    showMessage("Saved progress could not be loaded. You can start a fresh tracker.");
}

pathButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const pathId = button.dataset.pathId;

        if (completedPaths.has(pathId)) {
            completedPaths.delete(pathId);
        } else {
            completedPaths.add(pathId);
        }

        renderProgress();
        saveProgress();
    });
});

resetButton.addEventListener("click", () => {
    completedPaths.clear();
    renderProgress();

    try {
        localStorage.removeItem(storageKey);
        showMessage("Progress reset.");
    } catch (error) {
        showMessage("Progress reset for this visit, but this browser could not update saved data.");
    }
});

themeButton.addEventListener("click", () => {
    themeIndex = (themeIndex + 1) % themes.length;
    const theme = themes[themeIndex];

    if (theme === "green") {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.dataset.theme = theme;
    }

    themeButton.setAttribute("aria-label", `Change color theme. Current theme: ${theme}.`);
});

renderProgress();
