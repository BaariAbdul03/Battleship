import { FLEET } from './shipConfig.js';

const ShipPlacementUI = (game, onComplete, updateCommentary) => {
    let currentOrientation = 'horizontal';
    let previewCells = [];

    const setupPhaseEl = document.getElementById('setup-phase');
    const battlePhaseEl = document.getElementById('battle-phase');
    const humanBoardEl = document.getElementById('human-board');
    const shipInfoEl = document.querySelector('.current-ship-info');

    const showSetupPhase = () => {
        setupPhaseEl.style.display = 'block';
        battlePhaseEl.style.display = 'none';
        if (shipInfoEl) shipInfoEl.style.display = 'block';
        renderShipList();
        setupBoardListeners();
    };

    const hideSetupPhase = () => {
        setupPhaseEl.style.display = 'none';
        battlePhaseEl.style.display = 'block';
    };

    const renderShipList = () => {
        const shipListEl = document.getElementById('ships-to-place');
        const currentShip = game.getCurrentShipToPlace();
        const placedShipNames = game.getHumanPlayer().getBoard().getShips().map(s => s.ship.name);

        if (!currentShip) {
            shipListEl.innerHTML = '<p class="all-placed">✅ All ships placed!</p>';
            document.getElementById('start-game-btn').disabled = false;
            if (shipInfoEl) shipInfoEl.style.display = 'none';
            return;
        }

        const shipsHTML = FLEET.map(ship => {
            const isPlaced = placedShipNames.includes(ship.name);
            const isCurrent = ship.name === currentShip.name && !isPlaced;
            return `
                <div class="ship-item ${isPlaced ? 'placed' : ''} ${isCurrent ? 'current' : ''}">
                    <span class="ship-symbol">${ship.symbol}</span>
                    <span class="ship-name">${ship.name}</span>
                    <span class="ship-length">(${ship.length} cells)</span>
                    ${isPlaced ? '<span class="checkmark">✓</span>' : ''}
                </div>
            `;
        }).join('');

        shipListEl.innerHTML = shipsHTML;
        document.getElementById('current-ship-name').textContent = currentShip.name;
        document.getElementById('current-ship-length').textContent = currentShip.length;
        document.getElementById('start-game-btn').disabled = true;
    };

    const setupBoardListeners = () => {
        const cells = humanBoardEl.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const x = index % 10;
            const y = Math.floor(index / 10);

            cell.addEventListener('mouseenter', () => showPreview(x, y));
            cell.addEventListener('mouseleave', clearPreview);
            cell.addEventListener('click', () => placeShip(x, y));
        });
    };

    const showPreview = (x, y) => {
        clearPreview();
        const currentShip = game.getCurrentShipToPlace();
        if (!currentShip) return;

        const cells = [];
        const length = currentShip.length;
        let valid = true;

        for (let i = 0; i < length; i++) {
            let cellX, cellY;
            if (currentOrientation === 'horizontal') {
                cellX = x + i;
                cellY = y;
            } else {
                cellX = x;
                cellY = y + i;
            }

            if (cellX >= 10 || cellY >= 10) {
                valid = false;
                break;
            }

            const cellIndex = cellY * 10 + cellX;
            const cellEl = humanBoardEl.children[cellIndex];
            if (cellEl && cellEl.classList.contains('ship')) {
                valid = false;
            }
            cells.push(cellEl);
        }

        cells.forEach(cellEl => {
            if (cellEl) {
                cellEl.classList.add('preview');
                if (!valid) {
                    cellEl.classList.add('invalid');
                }
            }
        });

        previewCells = cells;
    };

    const clearPreview = () => {
        previewCells.forEach(cell => {
            if (cell) {
                cell.classList.remove('preview', 'invalid');
            }
        });
        previewCells = [];
    };

    const placeShip = (x, y) => {
        const result = game.placeHumanShip([x, y], currentOrientation);

        if (result.success) {
            if (window.gameAudio) window.gameAudio.playClick();
            renderHumanBoard();
            renderShipList();
            clearPreview();

            if (result.shipsRemaining === 0) {
                document.getElementById('start-game-btn').disabled = false;
                updateCommentary('SYSTEM', 'All ships positioned. Ready to engage the enemy!');
            }
        } else {
            // Provide visual feedback for invalid placement
            previewCells.forEach(cell => {
                if (cell) {
                    cell.classList.add('invalid');
                }
            });
            setTimeout(() => {
                previewCells.forEach(cell => {
                    if (cell) {
                        cell.classList.remove('invalid');
                    }
                });
            }, 300);

            // Show error message in commentary
            updateCommentary('SYSTEM', `Placement Error: ${result.message}`);
        }
    };

    const renderHumanBoard = () => {
        const board = game.getHumanPlayer().getBoard();
        const ships = board.getShips();

        // Clear all ship classes
        const cells = humanBoardEl.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.remove('ship'));

        // Add ship classes
        ships.forEach(({ coords }) => {
            coords.forEach(([x, y]) => {
                const cellIndex = y * 10 + x;
                const cellEl = cells[cellIndex];
                if (cellEl) {
                    cellEl.classList.add('ship');
                }
            });
        });
    };

    const rotateShip = () => {
        currentOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        document.getElementById('orientation-display').textContent =
            currentOrientation === 'horizontal' ? '→' : '↓';
        if (window.gameAudio) window.gameAudio.playClick();
    };

    const autoPlace = () => {
        game.autoPlaceHumanShips();
        renderHumanBoard();
        renderShipList();
        if (window.gameAudio) window.gameAudio.playClick();
    };

    const startGame = () => {
        const started = game.startGame();
        if (started) {
            hideSetupPhase();
            if (onComplete) onComplete();
            if (window.gameAudio) window.gameAudio.playClick();
        }
    };

    // Setup button listeners
    document.getElementById('rotate-btn').addEventListener('click', rotateShip);
    document.getElementById('auto-place-btn').addEventListener('click', autoPlace);
    document.getElementById('start-game-btn').addEventListener('click', startGame);

    return {
        show: showSetupPhase,
        hide: hideSetupPhase
    };
};

export default ShipPlacementUI;
