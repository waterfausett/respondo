const triggerService = require('../services/trigger.service');

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
                const triggerPattern = new RegExp(`(^|\\W)${escapeRegExp(key.toLowerCase())}($|\\W)`)
                return cleanMessage.match(triggerPattern);
            })
            .forEach(key => {
                const randomResponse = guildResponses[key][Math.floor(Math.random() * guildResponses[key].length)];
                responseMessages.push({message: randomResponse});
            });

        return responseMessages;
    }
};