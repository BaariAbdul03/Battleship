
import Game from './game.js';
import { renderBoards, setupEventListeners, updateCommentary } from './dom.js';
import AudioManager from './audio.js';
import ShipPlacementUI from './shipPlacement.js';

const init = () => {
    const game = Game();
    const human = game.getHumanPlayer();
    const computer = game.getComputerPlayer();
    const audio = AudioManager();
    let shipPlacementUI;

    const updateTurnIndicators = () => {
        const humanIndicator = document.getElementById('human-turn-indicator');
        const computerIndicator = document.getElementById('computer-turn-indicator');

        if (game.getCurrentPlayer() === human) {
            humanIndicator.classList.add('active-turn');
            computerIndicator.classList.remove('active-turn');
            humanIndicator.textContent = "YOUR TURN";
            computerIndicator.textContent = "WAITING...";
        } else {
            humanIndicator.classList.remove('active-turn');
            computerIndicator.classList.add('active-turn');
            humanIndicator.textContent = "WAITING...";
            computerIndicator.textContent = "COMPUTER THINKING...";
        }
    };

    const updateUI = () => {
        renderBoards(human.getBoard(), computer.getBoard());
        updateTurnIndicators();

        if (game.isGameOver()) {
            document.body.classList.add('game-over');
            const winner = game.getWinner();
            const message = winner.getType() === 'human' ? "You win!" : "Computer wins!";
            document.getElementById('status-message').textContent = message;
            document.getElementById('game-status').style.display = 'block';

            // Play victory or defeat sound
            if (winner.getType() === 'human') {
                audio.playVictory();
            } else {
                audio.playDefeat();
            }
        }
    };

    const handleHumanTurn = async (coords) => {
        if (game.getGamePhase() !== 'playing') return;
        if (game.isGameOver() || game.getCurrentPlayer() !== human) return;

        const result = await game.playRound(coords);
        if (result.status === 'invalid') {
            // Optional: Play error sound
            return;
        }

        // Play sound based on result
        const computerBoard = computer.getBoard();
        const isMiss = computerBoard.getMissedAttacks().some(([x, y]) => x === coords[0] && y === coords[1]);

        if (!isMiss) {
            // It's a hit - check if ship was sunk
            const ships = computerBoard.getShips();
            const hitShip = ships.find(({ coords: shipCoords }) =>
                shipCoords.some(([sx, sy]) => sx === coords[0] && sy === coords[1])
            );

            if (hitShip && hitShip.ship.isSunk()) {
                audio.playSink();
            } else {
                audio.playHit();
            }
        } else {
            audio.playMiss();
        }

        updateUI();

        if (result.status !== 'game_over' && result.status !== 'win') {
            // Trigger computer turn with a small delay for better UX
            setTimeout(handleComputerTurn, 1000);
        }
    };

    const handleComputerTurn = async () => {
        if (game.isGameOver()) return;

        const result = await game.playRound();

        if (result.commentary) {
            updateCommentary(result.commentary);
        }

        // Play sound for computer's attack
        if (result.coords) {
            const humanBoard = human.getBoard();
            const isMiss = humanBoard.getMissedAttacks().some(([x, y]) => x === result.coords[0] && y === result.coords[1]);

            if (!isMiss) {
                const ships = humanBoard.getShips();
                const hitShip = ships.find(({ coords: shipCoords }) =>
                    shipCoords.some(([sx, sy]) => sx === result.coords[0] && sy === result.coords[1])
                );

                if (hitShip && hitShip.ship.isSunk()) {
                    audio.playSink();
                } else {
                    audio.playHit();
                }
            } else {
                audio.playMiss();
            }
        }

        updateUI();
    };

    // Audio Controls
    const setupAudioControls = () => {
        const muteBtn = document.getElementById('mute-btn');
        const volumeSlider = document.getElementById('volume-slider');

        muteBtn.addEventListener('click', () => {
            const isMuted = audio.toggleMute();
            muteBtn.textContent = isMuted ? '🔇' : '🔊';
        });

        volumeSlider.addEventListener('input', (e) => {
            audio.setVolume(e.target.value);
        });
    };

    // Initialize Game
    const startGame = () => {
        // Render empty boards first to create cells for ShipPlacementUI
        renderBoards(human.getBoard(), computer.getBoard());

        // Initialize Ship Placement UI
        shipPlacementUI = ShipPlacementUI(game, () => {
            // Callback when placement is done and game starts
            updateUI();
            setupEventListeners(handleHumanTurn);
            updateCommentary("Systems online. Enemy fleet detected. Awaiting orders, Commander.");
        });

        shipPlacementUI.show();
        setupAudioControls();

        // Make audio globally accessible
        window.gameAudio = audio;
    };

    const resetGame = () => {
        // Reset game state
        game.resetGame();

        // Reset UI
        document.body.classList.remove('game-over');
        document.getElementById('game-status').style.display = 'none';
        document.getElementById('human-turn-indicator').textContent = "YOUR TURN";
        document.getElementById('computer-turn-indicator').textContent = "WAITING...";
        document.getElementById('human-turn-indicator').classList.remove('active-turn');
        document.getElementById('computer-turn-indicator').classList.remove('active-turn');

        // Reset commentary
        updateCommentary("INITIALIZING...");

        // Restart setup
        startGame();

        if (window.gameAudio) window.gameAudio.playClick();
    };

    document.getElementById('play-again-btn').addEventListener('click', resetGame);

    startGame();
};

init();
