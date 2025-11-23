class SmartOpponent {
    constructor() {
        this.mode = 'HUNT'; // 'HUNT' | 'TARGET'
        this.targetStack = [];
        this.lastHit = null;
        this.boardSize = 10;
        this.attackedCoords = new Set();
    }

    getLegalMove(enemyBoard) {
        if (this.mode === 'TARGET' && this.targetStack.length > 0) {
            const coords = this.targetStack.pop();
            if (this.isAlreadyAttacked(coords)) {
                return this.getLegalMove(enemyBoard); // Recurse if already attacked
            }
            return coords;
        }

        // Fallback to HUNT mode if stack is empty or in HUNT mode
        this.mode = 'HUNT';
        return this.getRandomMove(enemyBoard);
    }

    notifyResult(coords, result) {
        const [x, y] = coords;
        this.attackedCoords.add(`${x},${y}`);

        if (result === 'hit') {
            this.mode = 'TARGET';
            this.lastHit = coords;
            this.pushAdjacentCoords(x, y);
        } else if (result === 'sunk') {
            this.mode = 'HUNT';
            this.targetStack = []; // Clear stack on sink (simplification, might clear valid targets for other ships but safe)
            // A better approach for 'sunk' is to keep the stack but maybe filter out ones that are definitely not part of another ship?
            // For now, clearing stack is a safe "reset" to avoid getting stuck, but might miss adjacent ships.
            // Let's stick to clearing for this iteration.
        }
    }

    pushAdjacentCoords(x, y) {
        const adjacents = [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1]
        ];

        adjacents.forEach(([nx, ny]) => {
            if (this.isValidCoord(nx, ny) && !this.isAlreadyAttacked([nx, ny])) {
                this.targetStack.push([nx, ny]);
            }
        });
    }

    getRandomMove(enemyBoard) {
        let x, y;
        let attempts = 0;
        const maxAttempts = 1000;

        do {
            x = Math.floor(Math.random() * this.boardSize);
            y = Math.floor(Math.random() * this.boardSize);
            attempts++;
        } while (this.isAlreadyAttacked([x, y]) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            // Scan for first available
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (!this.isAlreadyAttacked([i, j])) return [i, j];
                }
            }
            return null; // Should not happen
        }
        return [x, y];
    }

    isValidCoord(x, y) {
        return x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize;
    }

    isAlreadyAttacked([x, y]) {
        return this.attackedCoords.has(`${x},${y}`);
    }
}

export default SmartOpponent;
