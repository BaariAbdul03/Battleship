const RandomAI = (enemyBoard) => {
  const size = 10;
  const attackedCoords = new Set();

  // Pre-populate attacked coords from the board to avoid re-hitting known spots
  // This is important if the AI is initialized mid-game or if we want to be stateless-ish
  // But for now, let's just keep track of our own history or query the board.
  // Querying the board is safer.
  
  const getLegalMove = () => {
    let x, y;
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loops

    do {
      x = Math.floor(Math.random() * size);
      y = Math.floor(Math.random() * size);
      attempts++;
    } while (isAlreadyAttacked(x, y, enemyBoard) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
       // Fallback: find first available spot
       for(let i=0; i<size; i++) {
           for(let j=0; j<size; j++) {
               if(!isAlreadyAttacked(i, j, enemyBoard)) {
                   return [i, j];
               }
           }
       }
       return null; // No moves left
    }

    return [x, y];
  };

  const isAlreadyAttacked = (x, y, board) => {
      const missed = board.getMissedAttacks();
      const hits = board.getAttackedCoords(); // This might need to be exposed or checked differently
      // Actually gameboard.js exposes getMissedAttacks and getAttackedCoords (which seems to be all received attacks?)
      // Let's check gameboard.js again.
      // gameboard.js:
      // attackedCoords.push([x, y]); -> this tracks ALL attacks.
      // So we just need to check if [x,y] is in attackedCoords.
      
      // However, arrays are reference types, so we need to check values.
      const allAttacks = board.getAttackedCoords();
      return allAttacks.some(([ax, ay]) => ax === x && ay === y);
  };

  return {
    getLegalMove
  };
};

export default RandomAI;
