import Ship from "../ship.js";

test('create a ship with the right length', () => {
    const ship = Ship(3);
    expect(ship.length).toBe(3);
});

test('ship is not sunk initially', () => {
    const ship = Ship(3);
    expect(ship.isSunk()).toBe(false);
});

test('ship is hit', () => {
    const ship = Ship(3);
    ship.hit();
    expect(ship.hits).toBe(1);
});

test('ship is sunk when hits equal length', () => {
    const ship = Ship(2);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
});