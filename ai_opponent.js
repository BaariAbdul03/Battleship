
const SmartOpponent = (enemyBoard) => {
    const size = 10;

    const isAlreadyAttacked = (x, y) => {
        const allAttacks = enemyBoard.getAttackedCoords();
        return allAttacks.some(([ax, ay]) => ax === x && ay === y);
    };

    const fire = () => {
        let x, y;
        let attempts = 0;
        const maxAttempts = 1000;
        let commentary = "";

        // Simple random strategy for now, but extensible
        // In a real "Smart" AI, we would have target mode, etc.
        // For now, we just add commentary to the random shots.

        do {
            x = Math.floor(Math.random() * size);
            y = Math.floor(Math.random() * size);
            attempts++;
        } while (isAlreadyAttacked(x, y) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            // Fallback: find first available spot
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (!isAlreadyAttacked(i, j)) {
                        enemyBoard.receiveAttack([i, j]);
                        return { coords: [i, j], commentary: "Scanning for any remaining targets..." };
                    }
                }
            }
            return { coords: null, commentary: "No moves left!" };
        }

        enemyBoard.receiveAttack([x, y]);
        commentary = `Firing at coordinates [${x}, ${y}]...`;

        return { coords: [x, y], commentary };
    };

    return {
        fire
    };
};

export default SmartOpponent;
