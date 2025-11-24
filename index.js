
import Game from './game.js';
import { renderBoards, setupEventListeners, updateCommentary } from './dom.js';
import AudioManager from './audio.js';
import ShipPlacementUI from './shipPlacement.js';
import CommentarySystem from './CommentarySystem.js';

const init = () => {
    const game = Game();
    const human = game.getHumanPlayer();
    const computer = game.getComputerPlayer();
    const audio = AudioManager();
    const commentary = CommentarySystem();
    let shipPlacementUI;
    let isCommenting = false;

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
            computerIndicator.textContent = "COMPUTER'S TURN";
            humanIndicator.textContent = "WAITING...";
        }
    };

    const displayCommentary = async (speaker, text) => {
        while (isCommenting) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        isCommenting = true;
        
        const speakerElement = document.getElementById('commentary-speaker');
        if (speakerElement) {
            speakerElement.textContent = speaker ? `${speaker}:` : '';
        }
        updateCommentary(text);
        
        isCommenting = false;
    };

    const updateUI = () => {
        renderBoards(human.getBoard(), computer.getBoard());
        updateTurnIndicators();

        if (game.isGameOver()) {
            const winner = game.getWinner();
            const winnerMessage = winner.getType() === 'human' ? 'YOU WIN!' : 'COMPUTER WINS!';
            document.getElementById('status-message').textContent = winnerMessage;
            document.getElementById('game-status').style.display = 'block';
            document.body.classList.add('game-over');

            if (winner.getType() === 'human') {
                audio.playVictory();
                displayCommentary('SYSTEM', 'Congratulations, Commander! All enemy ships have been neutralized.');
            } else {
                audio.playDefeat();
                displayCommentary('SYSTEM', 'A tough loss, Commander. We\'ll get them next time.');
            }
        }
    };

    const handleHumanTurn = (coords) => {
        if (game.getGamePhase() !== 'playing' || game.isGameOver() || game.getCurrentPlayer() !== human) return;

        displayCommentary('PLAYER', `Firing at [${coords[0]}, ${coords[1]}]...`);

        const result = game.playRound(coords);
        if (result.status === 'invalid') {
            return;
        }

        updateUI();
        handleHumanCommentary(result.attackResult, coords);

        if (result.status !== 'game_over' && result.status !== 'win') {
            setTimeout(handleComputerTurn, 1500);
        }
    };

    const handleHumanCommentary = (attackResult, coords) => {
        const onCommentaryReady = (commentary) => {
            if (commentary) {
                displayCommentary('COMPUTER', commentary);
            }
        };

        if (attackResult.status === 'hit') {
            if (attackResult.sunk) {
                audio.playSink();
                commentary.getCommentary('player_sink', {
                    shipType: attackResult.ship.name || 'ship',
                    coords: `[${coords[0]}, ${coords[1]}]`
                }).then(onCommentaryReady);
            } else {
                audio.playHit();
                commentary.getCommentary('player_hit', {
                    coords: `[${coords[0]}, ${coords[1]}]`,
                    ship: attackResult.ship
                }).then(onCommentaryReady);
            }
        } else {
            audio.playMiss();
            commentary.getCommentary('player_miss', {
                coords: `[${coords[0]}, ${coords[1]}]`
            }).then(onCommentaryReady);
        }
    };

    const showThinking = async () => {
        const humanBoardEl = document.getElementById('human-board');
        const cells = humanBoardEl.querySelectorAll('.cell');
        const delay = 15;

        const cellOrder = Array.from(Array(100).keys()).sort(() => Math.random() - 0.5);

        for (let i = 0; i < cellOrder.length; i++) {
            const cellIndex = cellOrder[i];
            const cell = cells[cellIndex];

            if (cell && !cell.classList.contains('hit') && !cell.classList.contains('miss')) {
                cell.classList.add('thinking-cell');
                await new Promise(resolve => setTimeout(resolve, delay));
                cell.classList.remove('thinking-cell');
            }
        }
    };

    const handleComputerTurn = async () => {
        if (game.isGameOver()) return;

        displayCommentary('COMPUTER', 'Analyzing target grid...');
        await showThinking();

        const onCommentaryReady = (commentary) => {
            if (commentary) {
                displayCommentary('COMPUTER', commentary);
            }
        };
        
        const result = game.playRound(undefined, onCommentaryReady);

        if (result.attackResult) {
            if (result.attackResult.status === 'hit') {
                if (result.attackResult.sunk) {
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

    const startGame = () => {
        renderBoards(human.getBoard(), computer.getBoard());

        shipPlacementUI = ShipPlacementUI(game, () => {
            updateUI();
            setupEventListeners(handleHumanTurn);
            displayCommentary("SYSTEM", "Systems online. Enemy fleet detected. Awaiting orders, Commander.");
        }, (speaker, text) => displayCommentary(speaker, text));

        shipPlacementUI.show();
        setupAudioControls();
        window.gameAudio = audio;
    };

    const resetGame = () => {
        game.resetGame();
        document.body.classList.remove('game-over');
        document.getElementById('game-status').style.display = 'none';
        document.getElementById('human-turn-indicator').textContent = "YOUR TURN";
        document.getElementById('computer-turn-indicator').textContent = "WAITING...";
        document.getElementById('human-turn-indicator').classList.remove('active-turn');
        document.getElementById('computer-turn-indicator').classList.remove('active-turn');
        displayCommentary("SYSTEM", "INITIALIZING...");
        startGame();
        if (window.gameAudio) window.gameAudio.playClick();
    };

    document.getElementById('play-again-btn').addEventListener('click', resetGame);

    startGame();
};

init();
