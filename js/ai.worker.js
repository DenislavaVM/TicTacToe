import { minimax } from "./utils.js";

self.onmessage = (e) => {
    const { board, computer, player } = e.data;
    try {
        const result = minimax(board, computer, player);
        self.postMessage(result.index);
    } catch (err) {
        self.postMessage({ error: err?.message || "AI error" });
    };
};