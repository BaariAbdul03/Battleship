// Ship configuration for authentic Battleship game
export const SHIP_TYPES = {
    CARRIER: { name: 'Carrier', length: 5, symbol: '🚢' },
    BATTLESHIP: { name: 'Battleship', length: 4, symbol: '⚓' },
    CRUISER: { name: 'Cruiser', length: 3, symbol: '🛥️' },
    SUBMARINE: { name: 'Submarine', length: 3, symbol: '🔱' },
    DESTROYER: { name: 'Destroyer', length: 2, symbol: '⛵' }
};

export const FLEET = [
    SHIP_TYPES.CARRIER,
    SHIP_TYPES.BATTLESHIP,
    SHIP_TYPES.CRUISER,
    SHIP_TYPES.SUBMARINE,
    SHIP_TYPES.DESTROYER
];

export default { SHIP_TYPES, FLEET };
