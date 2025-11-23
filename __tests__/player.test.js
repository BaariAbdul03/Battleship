import Player from "../player.js";
import Gameboard from "../gameboard.js";

test('initialize player with a gameboard', () => {
    const player = Player('human');
    const board = player.getBoard();
    expect(board).toBeDefined();
    expect(typeof board.placeShip).toBe('function');
    expect(typeof board.getShips).toBe('function');
});

test('player has a type', () => {
    const human = Player('human');
    expect(human.getType()).toBe('human');
    const computer = Player('computer');
    expect(computer.getType()).toBe('computer');
});