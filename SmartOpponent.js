import CommentarySystem from './CommentarySystem.js';

const SmartOpponent = (enemyBoard) => {
    const size = 10;
    const targetStack = [];
    let lastMove = null;
    const attackedCoords = new Set();
    const commentary = CommentarySystem();

    const fire = async () => {
        let aiCommentary = null;

        // 1. Check result of last move if it exists
        if (lastMove) {
            const [lx, ly] = lastMove;
            const isMiss = enemyBoard.getMissedAttacks().some(([mx, my]) => mx === lx && my === ly);

            if (!isMiss) {
                // Hit!
                addNeighborsToStack(lx, ly);

                // Trigger Commentary
                const comment = await commentary.getCommentary('hit', { coords: `[${lx}, ${ly}]` });
                if (comment) {
                    console.log("AI says:", comment);
                    aiCommentary = comment;
                }
            } else {
                // Miss
                const comment = await commentary.getCommentary('miss', { coords: `[${lx}, ${ly}]` });
                if (comment) {
                    console.log("AI says:", comment);
                    aiCommentary = comment;
                }
            }
        } else {
            // First move
            const comment = await commentary.getCommentary('game_start');
            if (comment) {
                console.log("AI says:", comment);
                aiCommentary = comment;
            }
        }

        let move = null;

        // 2. Process Stack (Target Mode)
        while (targetStack.length > 0) {
            const candidate = targetStack.pop();
            if (!isAlreadyAttacked(candidate[0], candidate[1])) {
                move = candidate;
                break;
            }
        }

        // 3. Hunt Mode (if no valid target from stack)
        if (!move) {
            move = getRandomMove();
        }

        // 4. Register move and return with commentary
        if (move) {
            lastMove = move;
            attackedCoords.add(`${move[0]},${move[1]}`);
            enemyBoard.receiveAttack(move);
            return { coords: move, commentary: aiCommentary };
        }

        return { coords: null, commentary: aiCommentary };
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
