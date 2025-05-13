import { initApp } from "./ui.js";
import { bindGameEvents } from "./game.js";

window.addEventListener("DOMContentLoaded", () => {
    initApp();
    bindGameEvents();
});