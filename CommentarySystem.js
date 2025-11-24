const CommentarySystem = () => {
    const API_URL = 'http://localhost:3000/api/get-commentary';

    const getCommentary = async (event, context) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ event, context })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.warn(`Server Error: ${response.status} ${response.statusText} - ${errorData.error}`);
                return getFallbackCommentary(event, context);
            }

            const data = await response.json();
            return data.commentary;
        } catch (error) {
            console.error("Error fetching commentary from server:", error);
            return getFallbackCommentary(event, context);
        }
    };

    const getFallbackCommentary = (event, context) => {
        const fallbacks = {
            'game_start': ["Enemy fleet detected. Battle stations!", "Let's sink them all, Commander!", "Target locked. Ready to fire."],
            'hit': ["Direct hit!", "Target impacted!", "Boom! That's a hit!", "We got them!"],
            'miss': ["Missed!", "Adjusting coordinates...", "Shot wide!", "No effect."],
            'sink': [`Enemy ${context.shipType || 'ship'} sunk!`, "Splash one!", "Target destroyed!", "That ship is history!"],
            'player_hit': ["We're taking fire!", "Hull breach detected!", "They hit us!", "Damage report!"],
            'player_miss': ["That was close!", "Evasive maneuvers successful!", "They missed us!", "No damage taken."],
            'player_sink': [`Our ${context.shipType || 'ship'} has been sunk!`, "We lost a ship!", "Man the lifeboats!", "They got one of ours!"],
            'win': ["Victory is ours!", "Enemy fleet eliminated!", "Mission accomplished!", "We rule the seas!"],
            'lose': ["We have been defeated.", "Abandon ship!", "Mission failed.", "Retreat!"]
        };

        const messages = fallbacks[event] || ["..."];
        return messages[Math.floor(Math.random() * messages.length)];
    };

    return {
        getCommentary
    };
};

export default CommentarySystem;
