const CommentarySystem = () => {
    const API_KEY = 'AIzaSyAjbmuP4p37BpOHihJjzG0NPlCyhnv0nro';
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const getCommentary = async (event, context) => {
        // API key check removed - will attempt to call Gemini API

        let prompt = "";
        switch (event) {
            case 'game_start':
                prompt = "You are a witty battleship commander. The game has just started. Give a short, encouraging or intimidating remark to the opponent.";
                break;
            case 'hit':
                prompt = `You are a battleship commander. You just hit an enemy ship at ${context.coords}. Make a brief, excited comment.`;
                break;
            case 'miss':
                prompt = `You are a battleship commander. You missed the enemy at ${context.coords}. Make a brief, frustrated or determined comment.`;
                break;
            case 'sink':
                prompt = `You are a battleship commander. You just sunk the enemy's ${context.shipType}. Gloat briefly.`;
                break;
            case 'win':
                prompt = "You are a battleship commander. You won the game! Celebrate briefly.";
                break;
            case 'lose':
                prompt = "You are a battleship commander. You lost the game. Be a gracious but disappointed loser briefly.";
                break;
            default:
                return null;
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
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            return text;
        } catch (error) {
            console.error("Error fetching commentary:", error);
            return null;
        }
    };

    return {
        getCommentary
    };
};

export default CommentarySystem;
