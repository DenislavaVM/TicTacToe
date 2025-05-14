export function playMoveSound() {
    try {
        const audio = new Audio("assets/sounds/Player-Moves.mp3");
        audio.play().catch(err => console.error("playMoveSound() failed:", err));
    } catch (err) {
        console.error("Error initializing move sound:", err);
    }
};

export function playWinSound() {
    try {
        const audio = new Audio("assets/sounds/Winning-Game.mp3");
        audio.play().catch(err => console.error("playWinSound() failed:", err));
    } catch (err) {
        console.error("Error initializing win sound:", err);
    };
};

export function playTieSound() {
    try {
        const audio = new Audio("assets/sounds/Tie-Game.mp3");
        audio.play().catch(err => console.error("playTieSound() failed:", err));
    } catch (err) {
        console.error("Error initializing tie sound:", err);
    };
};