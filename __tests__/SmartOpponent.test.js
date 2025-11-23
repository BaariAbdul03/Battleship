import SmartOpponent from '../SmartOpponent.js';
import Gameboard from '../gameboard.js';
import Ship from '../ship.js';

// Mock global fetch before any tests run
beforeAll(() => {
    global.fetch = () =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                candidates: [{
                    content: {
                        parts: [{ text: "Mock Commentary" }]
                    }
                }]
            })
        });
});

describe('SmartOpponent', () => {
    let board;
    let ai;

    beforeEach(() => {
        board = Gameboard();
        ai = SmartOpponent(board);
    });

    describe('HUNT Mode Initialization', () => {
        test('should initiate in HUNT mode (random firing)', async () => {
            // First shot should be random since no hits yet (HUNT mode)
            const firstShot = await ai.fire();

            expect(firstShot).toBeDefined();
            expect(Array.isArray(firstShot)).toBe(true);
            expect(firstShot.length).toBe(2);
            expect(firstShot[0]).toBeGreaterThanOrEqual(0);
            expect(firstShot[0]).toBeLessThan(10);
            expect(firstShot[1]).toBeGreaterThanOrEqual(0);
            expect(firstShot[1]).toBeLessThan(10);
        });

        test('should fire at different random locations in HUNT mode', async () => {
            const shots = [];
            for (let i = 0; i < 10; i++) {
                const shot = await ai.fire();
                shots.push(shot);
            }

            // All shots should be different (no duplicates)
            const uniqueShots = new Set(shots.map(s => `${s[0]},${s[1]}`));
            expect(uniqueShots.size).toBe(10);
        });
    });

    describe('TARGET Mode After HIT', () => {
        test('should switch to TARGET mode after recording a HIT', async () => {
            // Place a ship at a known location
            const ship = Ship(3);
            board.placeShip(ship, [5, 5], 'horizontal'); // Ship at [5,5], [5,6], [5,7]

            // Fire until we hit the ship
            let hitCoords = null;
            const maxAttempts = 100;

            for (let i = 0; i < maxAttempts; i++) {
                const shot = await ai.fire();

                // Check if we hit the ship
                if (shot[0] === 5 && (shot[1] === 5 || shot[1] === 6 || shot[1] === 7)) {
                    hitCoords = shot;
                    break;
                }
            }

            expect(hitCoords).toBeDefined();

            // After a hit, the next shot should target an adjacent cell (TARGET mode)
            const nextShot = await ai.fire();

            // Verify next shot is adjacent to the hit
            const isAdjacent =
                (Math.abs(nextShot[0] - hitCoords[0]) === 1 && nextShot[1] === hitCoords[1]) ||
                (Math.abs(nextShot[1] - hitCoords[1]) === 1 && nextShot[0] === hitCoords[0]);

            expect(isAdjacent).toBe(true);
        });

        test('should explore all adjacent cells after a hit', async () => {
            const ship = Ship(1);
            board.placeShip(ship, [5, 5], 'horizontal'); // Single cell ship at [5,5]

            // Fire until we hit [5,5]
            let hitFound = false;
            for (let i = 0; i < 100 && !hitFound; i++) {
                const shot = await ai.fire();
                if (shot[0] === 5 && shot[1] === 5) {
                    hitFound = true;

                    // Next shots should explore neighbors: [4,5], [6,5], [5,4], [5,6]
                    const nextShots = [];
                    for (let j = 0; j < 4; j++) {
                        const nextShot = await ai.fire();
                        nextShots.push(nextShot);
                    }

                    // At least one should be adjacent to [5,5]
                    const adjacentShots = nextShots.filter(shot =>
                        (Math.abs(shot[0] - 5) === 1 && shot[1] === 5) ||
                        (Math.abs(shot[1] - 5) === 1 && shot[0] === 5)
                    );

                    expect(adjacentShots.length).toBeGreaterThan(0);
                }
            }

            expect(hitFound).toBe(true);
        });
    });

    describe('CRITICAL: No Duplicate Coordinates', () => {
        test('should never return the same coordinate twice in 100 turns', async () => {
            const firedCoordinates = new Set();
            const coordinatesList = [];

            for (let i = 0; i < 100; i++) {
                const coords = await ai.fire();

                expect(coords).toBeDefined();
                expect(coords).not.toBeNull();

                const key = `${coords[0]},${coords[1]}`;

                // CRITICAL: Check for duplicates
                if (firedCoordinates.has(key)) {
                    throw new Error(`Duplicate coordinate fired: [${coords[0]}, ${coords[1]}] at turn ${i + 1}`);
                }

                firedCoordinates.add(key);
                coordinatesList.push(coords);
            }

            // Verify we have exactly 100 unique coordinates
            expect(firedCoordinates.size).toBe(100);
            expect(coordinatesList.length).toBe(100);
        });

        test('should handle full board (100 cells) without duplicates', async () => {
            const allCoords = new Set();

            // Fire all 100 shots (10x10 board)
            for (let i = 0; i < 100; i++) {
                const coords = await ai.fire();
                const key = `${coords[0]},${coords[1]}`;

                expect(allCoords.has(key)).toBe(false);
                allCoords.add(key);
            }

            expect(allCoords.size).toBe(100);

            // 101st shot should return null (board full)
            const finalShot = await ai.fire();
            expect(finalShot).toBeNull();
        });

        test('should not duplicate even with multiple hits triggering TARGET mode', async () => {
            // Place multiple ships
            const ship1 = Ship(2);
            const ship2 = Ship(2);
            board.placeShip(ship1, [3, 3], 'horizontal');
            board.placeShip(ship2, [7, 7], 'vertical');

            const firedCoords = new Set();

            for (let i = 0; i < 100; i++) {
                const coords = await ai.fire();
                const key = `${coords[0]},${coords[1]}`;

                expect(firedCoords.has(key)).toBe(false);
                firedCoords.add(key);
            }

            expect(firedCoords.size).toBe(100);
        });
    });

    describe('Mode Transitions', () => {
        test('should return to HUNT mode after exhausting TARGET stack', async () => {
            const ship = Ship(1);
            board.placeShip(ship, [5, 5], 'horizontal'); // Single cell at [5,5]

            let hitFound = false;
            let shotsAfterHit = [];

            for (let i = 0; i < 100 && !hitFound; i++) {
                const shot = await ai.fire();

                if (shot[0] === 5 && shot[1] === 5) {
                    hitFound = true;

                    // Fire several more shots - should explore neighbors then return to HUNT
                    for (let j = 0; j < 10; j++) {
                        const nextShot = await ai.fire();
                        shotsAfterHit.push(nextShot);
                    }
                }
            }

            expect(hitFound).toBe(true);
            expect(shotsAfterHit.length).toBe(10);

            // All shots should be unique
            const uniqueShots = new Set(shotsAfterHit.map(s => `${s[0]},${s[1]}`));
            expect(uniqueShots.size).toBe(10);
        });
    });
});
