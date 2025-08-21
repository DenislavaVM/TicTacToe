const moveAudio = new Audio("assets/sounds/Player-Moves.mp3");
const winAudio = new Audio("assets/sounds/Winning-Game.mp3");
const tieAudio = new Audio("assets/sounds/Tie-Game.mp3");

export function playMoveSound() {
    try {
        moveAudio.currentTime = 0;
        moveAudio.play().catch(err => console.error("playMoveSound() failed:", err));
    } catch (err) {
        console.error("Error initializing move sound:", err);
    };
};

export function playWinSound() {
    try {
        winAudio.currentTime = 0;
        winAudio.play().catch(err => console.error("playWinSound() failed:", err));
    } catch (err) {
        console.error("Error initializing win sound:", err);
    };
};

export function playTieSound() {
    try {
        tieAudio.currentTime = 0;
        tieAudio.play().catch(err => console.error("playTieSound() failed:", err));
    } catch (err) {
        console.error("Error initializing tie sound:", err);
    };
};