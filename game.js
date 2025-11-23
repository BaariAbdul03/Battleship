import Player from './player.js';
import Ship from './ship.js';
import SmartOpponent from './SmartOpponent.js';
import { FLEET } from './shipConfig.js';

const Game = () => {
    const human = Player('human');
    const computerPlayer = Player('computer');
    const computerAI = SmartOpponent(human.getBoard());
    let currentPlayer = human;
    let gameOver = false;
    let winner = null;
    let gamePhase = 'setup'; // 'setup', 'playing', 'gameover'
    let shipsToPlace = [...FLEET];
    let currentShipIndex = 0;

    // Helper function to randomly place all ships for a player
    const autoPlaceShips = (player) => {
        const board = player.getBoard();
        FLEET.forEach(shipType => {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 100;

            while (!placed && attempts < maxAttempts) {
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';

                try {
                    // Check if placement is valid (no overlaps)
                    const wouldOverlap = checkOverlap(board, Ship(shipType.length), [x, y], orientation);
                    if (!wouldOverlap) {
                        board.placeShip(Ship(shipType.length), [x, y], orientation);
                        placed = true;
                    }
                } catch (e) {
                    // Invalid placement, try again
                }
                attempts++;
            }
        });
    };

    // Check if ship placement would overlap with existing ships
    const checkOverlap = (board, ship, coords, orientation) => {
        const [x, y] = coords;
        const shipCoords = [];

        if (orientation === 'horizontal') {
            for (let i = 0; i < ship.length; i++) {
                shipCoords.push([x + i, y]);
            }
        } else {
            for (let i = 0; i < ship.length; i++) {
                shipCoords.push([x, y + i]);
            }
        }

        const existingShips = board.getShips();
        for (const { coords: existingCoords } of existingShips) {
            for (const [sx, sy] of shipCoords) {
                if (existingCoords.some(([ex, ey]) => ex === sx && ey === sy)) {
                    return true;
                }
            }
        }
        return false;
    };

    const switchTurn = () => {
        currentPlayer = currentPlayer === human ? computerPlayer : human;
    };

    return {
        getHumanPlayer() {
            return human;
        },
        getComputerPlayer() {
            return computerPlayer;
        },
        getCurrentPlayer() {
            return currentPlayer;
        },
        isGameOver() {
            return gameOver;
        },
        getWinner() {
            return winner;
        },
        getGamePhase() {
            return gamePhase;
        },
        getShipsToPlace() {
            return shipsToPlace;
        },
        getCurrentShipToPlace() {
            return shipsToPlace[currentShipIndex];
        },
        placeHumanShip(coords, orientation) {
            if (gamePhase !== 'setup') return { success: false, message: 'Not in setup phase' };
            if (currentShipIndex >= shipsToPlace.length) return { success: false, message: 'All ships placed' };

            const shipType = shipsToPlace[currentShipIndex];
            const ship = Ship(shipType.length);

            try {
                const wouldOverlap = checkOverlap(human.getBoard(), ship, coords, orientation);
                if (wouldOverlap) {
                    return { success: false, message: 'Ships cannot overlap' };
                }

                human.getBoard().placeShip(ship, coords, orientation);
                currentShipIndex++;

                return { success: true, shipsRemaining: shipsToPlace.length - currentShipIndex };
            } catch (e) {
                return { success: false, message: e.message };
            }
        },
        autoPlaceHumanShips() {
            if (gamePhase !== 'setup') return false;
            // Reset placement tracking first
            shipsToPlace = [...FLEET]; // Ensure shipsToPlace is fresh
            currentShipIndex = 0;
            // Clear existing ships from the board
            human.getBoard().reset();
            // Place all ships
            autoPlaceShips(human);
            currentShipIndex = shipsToPlace.length;
            return true;
        },
        startGame() {
            if (gamePhase !== 'setup') return false;
            if (currentShipIndex < shipsToPlace.length) return false; // Not all ships placed

            // Auto-place computer ships
            autoPlaceShips(computerPlayer);

            gamePhase = 'playing';
            currentPlayer = human;
            return true;
        },
        async playRound(coords) {
            if (gamePhase !== 'playing') return { status: 'invalid', message: 'Game not started' };
            if (gameOver) return { status: 'game_over' };

            // Human turn
            if (currentPlayer === human) {
                const enemyBoard = computerPlayer.getBoard();
                const alreadyAttacked = enemyBoard.getAttackedCoords().some(([x, y]) => x === coords[0] && y === coords[1]);
                if (alreadyAttacked) {
                    return { status: 'invalid', message: 'Already attacked' };
                }
                enemyBoard.receiveAttack(coords);

                if (enemyBoard.allSunk()) {
                    gameOver = true;
                    winner = human;
                    gamePhase = 'gameover';
                    return { status: 'win', winner: 'human' };
                }

                switchTurn();
                return { status: 'continue', currentPlayer: 'computer' };
            } else {
                // Computer turn
                const result = await computerAI.fire();
                const enemyBoard = human.getBoard();

                if (enemyBoard.allSunk()) {
                    gameOver = true;
                    winner = computerPlayer;
                    gamePhase = 'gameover';
                    return { status: 'win', winner: 'computer', commentary: result.commentary, coords: result.coords };
                }

                switchTurn();
                return { status: 'continue', currentPlayer: 'human', commentary: result.commentary, coords: result.coords };
            }
        },
        resetGame() {
            human.getBoard().reset();
            computerPlayer.getBoard().reset();
            currentPlayer = human;
            gameOver = false;
            winner = null;
            gamePhase = 'setup';
            currentShipIndex = 0;
            shipsToPlace = [...FLEET];
        }
    };
};

export default Game;
