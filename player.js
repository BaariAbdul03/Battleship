import Gameboard from './gameboard.js';

const Player = (type) => {
  const board = Gameboard();

  return {
    getBoard() {
      return board;
    },
    getType() {
      return type;
    }
  };
};

export default Player;
