
import SmartOpponent from '../ai_opponent.js';
import Gameboard from '../gameboard.js';

describe('SmartOpponent', () => {
    let board;
    let computer;

    beforeEach(() => {
        board = Gameboard();
        computer = SmartOpponent(board);
    });

    test('should fire at unique coordinates and return commentary', () => {
        const shots = new Set();
        for (let i = 0; i < 100; i++) {
            const result = computer.fire();
            if (result.coords) {
                const key = `${result.coords[0]},${result.coords[1]}`;
                shots.add(key);
                expect(result.commentary).toBeDefined();
            }
        }
        expect(shots.size).toBe(100);
    });

    test('should not fire at already attacked coordinates', () => {
        // Manually attack everything except [5,5]
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (i === 5 && j === 5) continue;
                board.receiveAttack([i, j]);
            }
        }

        const result = computer.fire();
        expect(result.coords).toEqual([5, 5]);
        // It might hit via random or fallback, so just check it returns the right coords
        // and some commentary.
        expect(result.commentary).toBeDefined();
    });
});
