const renderBoards = (humanBoard, computerBoard) => {
  const humanGrid = document.getElementById('human-board');
  const computerGrid = document.getElementById('computer-board');
  if (!humanGrid || !computerGrid) {
    console.error("Grid elements not found!");
    return;
  }

  console.log("Rendering boards...");
  console.log("Computer missed attacks:", computerBoard.getMissedAttacks());
  console.log("Computer attacked coords:", computerBoard.getAttackedCoords());

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

      const humanAttackedCoords = humanBoard.getAttackedCoords();
      humanBoard.getShips().forEach(({ ship, coords }) => {
        coords.forEach(([x, y]) => {
          if (x === j && y === i) {
            const isAttacked = humanAttackedCoords.some(([ax, ay]) => ax === x && ay === y);
            if (isAttacked) {
              humanCell.classList.add(ship.isSunk() ? 'sunk' : 'hit');
            } else {
              humanCell.classList.add('ship');
            }
          }
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
  console.log("updateCommentary called with:", text);
  const commentaryElement = document.getElementById('commentary-box');
  if (commentaryElement) {
    commentaryElement.textContent = text;
  }
};

export { renderBoards, setupEventListeners, updateCommentary };