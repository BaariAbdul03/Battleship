import Ship from './ship.js';

const Gameboard = () => {
  const ships = [];
  const missedAttacks = [];
  const attackedCoords = [];

  return {
    placeShip(ship, coords, orientation) {
      const shipCoords = [];
      const [x, y] = coords;
      const size = 10;
      if (orientation === 'horizontal') {
        if (x + ship.length > size) throw new Error("Ship exceeds board horizontally");
        for (let i = 0; i < ship.length; i++) {
          shipCoords.push([x + i, y]);
        }
      } else if (orientation === 'vertical') {
        if (y + ship.length > size) throw new Error("Ship exceeds board vertically");
        for (let i = 0; i < ship.length; i++) {
          shipCoords.push([x, y + i]);
        }
      }
      ships.push({ ship, coords: shipCoords });
    },
    getShips() {
      return ships;
    },
    receiveAttack([x, y]) {
      attackedCoords.push([x, y]);
      console.log("Receiving attack at:", [x, y]);
      for (const { ship, coords } of ships) {
        if (coords.some(([cx, cy]) => cx === x && cy === y)) {
          console.log("Hit ship at:", [x, y]);
          ship.hit();
          return {
            status: 'hit',
            ship: ship,
            sunk: ship.isSunk()
          };
        }
      }
      console.log("Miss at:", [x, y]);
      missedAttacks.push([x, y]);
      return { status: 'miss' };
    },
    getMissedAttacks() {
      return missedAttacks;
    },
    getAttackedCoords() {
      return attackedCoords;
    },
    allSunk() {
      return ships.every(({ ship }) => ship.isSunk());
    },
    reset() {
      ships.length = 0;
      missedAttacks.length = 0;
      attackedCoords.length = 0;
    }
  };
};

export default Gameboard;