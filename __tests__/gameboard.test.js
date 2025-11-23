import Ship from "../ship.js";
import Gameboard from "../gameboard.js";

test('place a ship on the gameboard', () => {
    const gameboard = Gameboard();
    const ship = Ship(3);
    gameboard.placeShip(ship, [0, 0], 'horizontal');
    expect(gameboard.getShips().length).toBe(1);
});

test('ship is positioned correctly', () => {
    const gameboard = Gameboard();
    const ship = Ship(2);
    gameboard.placeShip(ship, [0, 0], 'horizontal');
    expect(gameboard.getShips()[0].coords).toEqual([[0, 0], [1, 0]]);
});

test('ship is positioned vertically', () => {
    const gameboard = Gameboard();
    const ship = Ship(2);
    gameboard.placeShip(ship, [0, 0], 'vertical');
    expect(gameboard.getShips()[0].coords).toEqual([[0, 0], [0, 1]])
});

test('ship is hit', () => {
    const gameboard = Gameboard();
    const ship = Ship(2);
    gameboard.placeShip(ship, [0, 0], 'horizontal');
    gameboard.receiveAttack([0, 0]);
    expect(ship.hits).toBe(1);
});

test('missing attack', () => {
    const gameboard = Gameboard();
    const ship = Ship(2);
    gameboard.placeShip(ship, [0, 0], 'horizontal');
    gameboard.receiveAttack([5, 5]);
    expect(gameboard.getMissedAttacks()).toContainEqual([5, 5]);
});

test('ship has sunk', () => {
    const gameboard = Gameboard();
    const ship = Ship(1);
    gameboard.placeShip(ship, [0, 0], 'horizontal');
    gameboard.receiveAttack([0, 0]);
    expect(gameboard.allSunk()).toBe(true);
});