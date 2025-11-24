# ⚓ Battleship v1.0 🚢

![Battleship Game](https://img.shields.io/badge/Battleship-v1.0-blue?style=for-the-badge)  
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=flat-square)  
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

🎮 **Sink the enemy fleet in this classic naval combat game!**  
Welcome to **Battleship v1.0**, a single-player JavaScript implementation of the timeless strategy game. Face off against a cunning computer opponent, fire your shots, and aim to sink their ships before they sink yours. Built with modern ES6 modules, this project is a sleek foundation for an evolving game—version 1.0 is just the beginning! 🚀

![Battleship Gameplay](screenshot.png)  
*Sink the enemy ship and claim victory in Battleship v1.0!*

---

## 🌟 Features

- ⚔️ **Single-Player Action**: Challenge a computer opponent that strikes back with random attacks.
- 🛠️ **Modular Design**: Cleanly separated logic using ES6 modules for easy maintenance and scalability.
- 📊 **Interactive Grids**: Two 10x10 boards show your fleet and the enemy’s, with clear visual feedback:
  - 🟢 Gray for your ships.
  - 🟠 Orange for hits.
  - ⚪ White for misses.
  - 🔴 Red for sunk ships.
- 🔄 **Turn-Based Gameplay**: Alternate turns with the computer, keeping the tension high.
- 🏆 **Win Detection**: Celebrate victory with a "You win!" message when you sink the enemy fleet (or face defeat if they sink yours first).
- 🚫 **Post-Game Lock**: Clicks are disabled after the game ends, ensuring a clean finish.
- 🎨 **DOM-Driven UI**: Win messages are displayed elegantly in the DOM—no more pesky alerts!

---

## 🚀 Getting Started

Ready to command your fleet? Follow these steps to set up Battleship v1.0 on your local machine.

### Prerequisites

- A modern web browser (Chrome, Firefox, etc.).
- [Node.js](https://nodejs.org/) and npm installed.

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/battleship.git
    cd battleship
    ```

2.  **Install Dependencies**:
    Run the following command to install the necessary dependencies for both the game and the backend server:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a new file named `.env` in the root of the project and add your Gemini API key like this:
    ```
    GEMINI_API_KEY=YOUR_API_KEY
    ```
    *Note: The `.env` file is included in `.gitignore` to prevent your API key from being committed to the repository.*

4.  **Launch the Application**:
    You will need to run two processes: the backend server and a simple server for the frontend.

    -   **Start the Backend Server**:
        Open a terminal and run the following command to start the Node.js server:
        ```bash
        npm start
        ```
        This will start the server on `http://localhost:3000`.

    -   **Start the Frontend Server**:
        In a *second* terminal, run a simple HTTP server to serve the `index.html` file. If you have `live-server` installed, you can run:
        ```bash
        live-server
        ```
        Or, you can use Python's built-in server:
        ```bash
        python -m http.server
        ```
        This will typically serve the frontend on `http://localhost:8080` or `http://127.0.0.1:5500` if using VS Code's Live Server.

5.  **Start Playing**:
    Open the URL for your frontend server (e.g., `http://localhost:8080`) in your browser and dive into the game!

---

## 🎮 How to Play

1.  **Deploy Your Fleet**: Place all 5 of your ships on "Your Fleet" board. You can place them manually or use the "Auto Place" button.
2.  **Take Your Shot**: Click a cell on the "Enemy Waters" board to attack.
    -   🟠 Orange for a hit.
    -   ⚪ White for a miss.
    -   🔴 Red when the ship is fully sunk.
3.  **Computer’s Turn**: The enemy AI will analyze the board and fire back at your fleet.
4.  **Victory or Defeat**: The first to sink all opponent ships wins!
---

## 🛠️ Technologies Used

-   **JavaScript (ES6 Modules)** - Game logic and UI interactions
-   **Node.js & Express.js** - Backend server for secure API calls
-   **HTML & CSS** - Layout and styling

---

## 📜 License

This project is licensed under the **MIT License**. Feel free to modify and distribute it as you like.

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements, feel free to fork the repo and submit a pull request.

---

## 📞 Contact

For any questions or suggestions, reach out via [GitHub Issues](https://github.com/your-username/battleship/issues).

Happy gaming! 🚢🔥