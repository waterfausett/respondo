const triggerService = require('../../services/trigger.service');

function escapeRegExp(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = {
    handleMessage: async (message, guildId) => {
        const cleanMessage = message.trim().toLowerCase();
        const guildResponses = await triggerService.getResponses(guildId);
        const keys = Object.keys(guildResponses);
        const responseMessages = [];
        keys
            .filter(key => {
                const triggerPattern = new RegExp(`(^|\\W)${escapeRegExp(key)}($|\\W)`)
                return cleanMessage.match(triggerPattern);
            })
            .forEach(key => {
                const randomResponse = guildResponses[key].responses[Math.floor(Math.random() * guildResponses[key].responses.length)];
                responseMessages.push({message: randomResponse});
            });

        return responseMessages;
    }
};