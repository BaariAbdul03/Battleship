import CommentarySystem from './CommentarySystem.js';

const SmartOpponent = (enemyBoard) => {
    const size = 10;
    let mode = 'hunt'; // 'hunt' or 'target'
    let targetQueue = [];
    let firstHit = null;
    let knownHits = [];
    let currentOrientation = null; // null, 'horizontal', or 'vertical'
    const attackedCoords = new Set();
    const commentary = CommentarySystem();

    const resetTargeting = () => {
        mode = 'hunt';
        targetQueue = [];
        firstHit = null;
        knownHits = [];
        currentOrientation = null;
    };

    const fire = (onCommentaryReady) => {
        let move = getNextMove();

        if (move) {
            attackedCoords.add(`${move[0]},${move[1]}`);
            const result = enemyBoard.receiveAttack(move);

            if (result.status === 'hit') {
                handleHit(move, result);
                if (result.sunk) {
                    commentary.getCommentary('sink', { shipType: result.ship.name, coords: `[${move[0]}, ${move[1]}]` })
                        .then(onCommentaryReady);
                    resetTargeting(); // Ship is sunk, go back to hunting
                } else {
                    commentary.getCommentary('hit', { coords: `[${move[0]}, ${move[1]}]`, ship: result.ship })
                        .then(onCommentaryReady);
                }
            } else {
                // Miss
                if (mode === 'target') {
                    if (knownHits.length === 1) {
                        // If we only had one hit, we guessed the orientation wrong.
                    }
                    currentOrientation = null; // Re-evaluate orientation on next hit
                }
                commentary.getCommentary('miss', { coords: `[${move[0]}, ${move[1]}]` })
                    .then(onCommentaryReady);
            }

            return { coords: move, result };
        }

        return { coords: null, result: null };
    };

    const getNextMove = () => {
        // 1. Process Target Queue
        while (targetQueue.length > 0) {
            const candidate = targetQueue.shift(); // Use shift for FIFO queue behavior
            if (!isAlreadyAttacked(candidate[0], candidate[1])) {
                return candidate;
            }
        }

        // 2. Hunt Mode (if no valid target from queue)
        mode = 'hunt';
        return getRandomMove();
    };

    const handleHit = (move, result) => {
        mode = 'target';
        knownHits.push(move);
        knownHits.sort((a, b) => a[0] - b[0] || a[1] - b[1]); // Sort hits to find endpoints

        if (knownHits.length === 1) {
            // First hit, add all neighbors to the queue
            addNeighborsToQueue(move[0], move[1]);
        } else {
            // Second or subsequent hit, determine orientation and refine targets
            if (!currentOrientation) {
                if (knownHits[0][0] === knownHits[1][0]) {
                    currentOrientation = 'vertical';
                } else if (knownHits[0][1] === knownHits[1][1]) {
                    currentOrientation = 'horizontal';
                }
            }

            // Clear the queue and add only the most logical targets
            targetQueue = [];
            const first = knownHits[0];
            const last = knownHits[knownHits.length - 1];

            if (currentOrientation === 'horizontal') {
                targetQueue.push([first[0] - 1, first[1]]); // Cell before the first hit
                targetQueue.push([last[0] + 1, last[1]]);   // Cell after the last hit
            } else if (currentOrientation === 'vertical') {
                targetQueue.push([first[0], first[1] - 1]); // Cell above the first hit
                targetQueue.push([last[0], last[1] + 1]);   // Cell below the last hit
            }
        }
    };

    const addLinearTargets = (x, y) => {
        if (currentOrientation === 'horizontal') {
            targetQueue.push([x + 1, y]);
            targetQueue.push([x - 1, y]);
        } else if (currentOrientation === 'vertical') {
            targetQueue.push([x, y + 1]);
            targetQueue.push([x, y - 1]);
        }
    };


    const addNeighborsToQueue = (x, y) => {
        const neighbors = [
            [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]
        ];
        neighbors.sort(() => Math.random() - 0.5); // Randomize to be less predictable
        neighbors.forEach(([nx, ny]) => {
            if (isValidCoord(nx, ny) && !isAlreadyAttacked(nx, ny)) {
                targetQueue.push([nx, ny]);
            }
        });
    };

    const getRandomMove = () => {
        let x, y;
        let attempts = 0;
        const maxAttempts = 1000;
        do {
            x = Math.floor(Math.random() * size);
            y = Math.floor(Math.random() * size);
            attempts++;
        } while (isAlreadyAttacked(x, y) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (!isAlreadyAttacked(i, j)) return [i, j];
                }
            }
            return null;
        }
        return [x, y];
    };

    const isValidCoord = (x, y) => {
        return x >= 0 && x < size && y >= 0 && y < size;
    };

    const isAlreadyAttacked = (x, y) => {
        if (attackedCoords.has(`${x},${y}`)) return true;
        const boardAttacks = enemyBoard.getAttackedCoords();
        const isAttackedOnBoard = boardAttacks.some(([ax, ay]) => ax === x && ay === y);
        if (isAttackedOnBoard) {
            attackedCoords.add(`${x},${y}`);
            return true;
        }
        return false;
    };

    return {
        fire
    };
};

export default SmartOpponent;
