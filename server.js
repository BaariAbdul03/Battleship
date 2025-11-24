import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/get-commentary', async (req, res) => {
    const { event, context } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    let prompt = "";
    switch (event) {
        case 'game_start':
            prompt = "You are a witty battleship commander. The game has just started. Give a short, encouraging or intimidating remark to the opponent.";
            break;
        case 'hit':
            const shipInfo = context.ship ? `the enemy's ${context.ship.name}` : 'an enemy ship';
            prompt = `You are a battleship commander. You just hit ${shipInfo} at ${context.coords}. Make a brief, excited comment.`;
            break;
        case 'miss':
            prompt = `You are a battleship commander. You missed the enemy at ${context.coords}. Make a brief, frustrated or determined comment.`;
            break;
        case 'sink':
            prompt = `You are a battleship commander. You just sunk the enemy's ${context.shipType}. Gloat briefly.`;
            break;
        case 'player_hit':
            const playerShipInfo = context.ship ? `our ${context.ship.name}` : 'one of our ships';
            prompt = `You are a battleship commander. The enemy just hit ${playerShipInfo} at ${context.coords}. React with concern or defiance. Keep it brief.`;
            break;
        case 'player_miss':
            prompt = `You are a battleship commander. The enemy missed at ${context.coords}. Make a brief, relieved or mocking comment.`;
            break;
        case 'player_sink':
            prompt = `You are a battleship commander. The enemy just sunk our ${context.shipType}. React with anger or determination. Keep it brief.`;
            break;
        case 'win':
            prompt = "You are a battleship commander. You won the game! Celebrate briefly.";
            break;
        case 'lose':
            prompt = "You are a battleship commander. You lost the game. Be a gracious but disappointed loser briefly.";
            break;
        default:
            return res.status(400).json({ error: 'Invalid event type' });
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            return res.status(response.status).json({ error: errorData });
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        res.json({ commentary: text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
