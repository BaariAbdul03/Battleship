const renderBoards = (humanBoard, computerBoard) => {
    const humanGrid = document.getElementById('human-board');
    const computerGrid = document.getElementById('computer-board');
    if (!humanGrid || !computerGrid) {
        console.error("Grid elements not found!");
        return;
    }
    humanGrid.innerHTML = '';
    computerGrid.innerHTML = '';

    const size = 10;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const humanCell = document.createElement('div');
            humanCell.classList.add('cell');
            const computerCell = document.createElement('div');
            computerCell.classList.add('cell');
            computerCell.dataset.x = j; // Column
            computerCell.dataset.y = i; // Row

            humanBoard.getMissedAttacks().forEach(([x, y]) => {
                if (x === j && y === i) humanCell.classList.add('miss');
            });
            computerBoard.getMissedAttacks().forEach(([x, y]) => {
                if (x === j && y === i) computerCell.classList.add('miss');
            });

            humanBoard.getShips().forEach(({ ship, coords }) => {
                coords.forEach(([x, y]) => {
                    if (x === j && y === i) humanCell.classList.add(ship.isSunk() ? 'sunk' : 'ship');
                });
            });
            computerBoard.getShips().forEach(({ ship, coords }) => {
                coords.forEach(([x, y]) => {
                    if (x === j && y === i && computerBoard.getAttackedCoords().some(([attX, attY]) => attX === j && attY === i)) {
                        computerCell.classList.add(ship.isSunk() ? 'sunk' : 'hit');
                    }
                });
            });

            humanGrid.appendChild(humanCell);
            computerGrid.appendChild(computerCell);
        }
    }

    // Render Enemy Fleet Status
    const enemyFleetContainer = document.getElementById('enemy-ships-list');
    if (enemyFleetContainer) {
        const ships = computerBoard.getShips();
        enemyFleetContainer.innerHTML = ships.map(({ ship }) => {
            const isSunk = ship.isSunk();
            return `
        <div style="
          padding: 5px 10px;
          border-radius: 5px;
          background: ${isSunk ? 'rgba(235, 51, 73, 0.2)' : 'rgba(255, 255, 255, 0.5)'};
          border: 1px solid ${isSunk ? '#eb3349' : '#ccc'};
          color: ${isSunk ? '#eb3349' : '#333'};
          font-size: 0.85em;
          font-weight: bold;
          text-decoration: ${isSunk ? 'line-through' : 'none'};
          opacity: ${isSunk ? '0.7' : '1'};
          display: flex;
          align-items: center;
          gap: 5px;
        ">
          <span>${ship.symbol || '🚢'}</span>
          <span>${ship.name}</span>
        </div>
      `;
        }).join('');
    }
};

const setupEventListeners = (callback) => {
    const computerGrid = document.getElementById('computer-board');
    computerGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('.cell');
        if (cell && !cell.classList.contains('hit') && !cell.classList.contains('miss')) {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            if (!isNaN(x) && !isNaN(y)) {
                callback([x, y]);
            }
        }
    });
};

const updateCommentary = (text) => {
    const commentaryElement = document.getElementById('commentary-box');
    if (commentaryElement) {
        commentaryElement.textContent = text;
    }
};

export { renderBoards, setupEventListeners, updateCommentary };