import CommentarySystem from './CommentarySystem.js';

const SmartOpponent = (enemyBoard) => {
    const size = 10;
    const targetStack = [];
    let lastMove = null;
    const attackedCoords = new Set();
    const commentary = CommentarySystem();

    const fire = async () => {
        let aiCommentary = null;
        let move = null;

        // 1. Process Stack (Target Mode)
        while (targetStack.length > 0) {
            const candidate = targetStack.pop();
            if (!isAlreadyAttacked(candidate[0], candidate[1])) {
                move = candidate;
                break;
            }
        }

        // 2. Hunt Mode (if no valid target from stack)
        if (!move) {
            move = getRandomMove();
        }

        // 3. Register move and execute attack
        if (move) {
            lastMove = move;
            attackedCoords.add(`${move[0]},${move[1]}`);

            // Execute attack and get detailed result
            const result = enemyBoard.receiveAttack(move);

            // 4. Generate Commentary based on result
            if (result.status === 'hit') {
                // Hit!
                addNeighborsToStack(move[0], move[1]);

                if (result.sunk) {
                    const comment = await commentary.getCommentary('sink', {
                        shipType: result.ship.name,
                        coords: `[${move[0]}, ${move[1]}]`
                    });
                    if (comment) aiCommentary = comment;
                } else {
                    const comment = await commentary.getCommentary('hit', {
                        coords: `[${move[0]}, ${move[1]}]`,
                        ship: result.ship
                    });
                    if (comment) aiCommentary = comment;
                }
            } else {
                // Miss
                const comment = await commentary.getCommentary('miss', { coords: `[${move[0]}, ${move[1]}]` });
                if (comment) aiCommentary = comment;
            }

            return { coords: move, commentary: aiCommentary };
        }

        return { coords: null, commentary: null };
    };

    const addNeighborsToStack = (x, y) => {
        const neighbors = [
            [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]
        ];
        neighbors.sort(() => Math.random() - 0.5);
        neighbors.forEach(([nx, ny]) => {
            if (isValidCoord(nx, ny) && !isAlreadyAttacked(nx, ny)) {
                targetStack.push([nx, ny]);
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
