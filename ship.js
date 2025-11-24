const Ship = (length, name = 'ship') => {
  return {
    length,
    name,
    hits: 0,
    hit() {
      this.hits += 1;
    },
    isSunk() {
      return this.hits >= this.length;
    }
  };
};

export default Ship;
