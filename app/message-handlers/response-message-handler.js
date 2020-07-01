const Discord = require('discord.js');
const triggerService = require('../services/trigger.service');

function escapeRegExp(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = {
    handleMessage: async (message, guildId) => {
        const cleanMessage = message.trim().toLowerCase();
        const guildResponses = await triggerService.getResponses(guildId);
        const keys = Object.keys(guildResponses);
        const matchedResponses = [];
        keys
            .filter(key => {
                const triggerPattern = new RegExp(`(^|\\W)${escapeRegExp(key.toLowerCase())}($|\\W)`)
                return cleanMessage.match(triggerPattern);
            })
            .forEach(key => {
                const randomResponse = guildResponses[key][Math.floor(Math.random() * guildResponses[key].length)];
                matchedResponses.push(randomResponse);
            });

        const responseMessages = [];
        matchedResponses.forEach(response => {
            const messageTerms = [];
            const messageAttachments = [];
            response.split(/ +/)
                .forEach(term => {
                    if (term.toLowerCase().startsWith('http')) {
                        messageAttachments.push(new Discord.MessageAttachment(term));
                    }
                    else {
                        messageTerms.push(term);
                    }
                });

            const responseTerms = [];
            if (messageTerms.length) {
                responseTerms.push(messageTerms.join(' '));
            }
            
            if (messageAttachments.length) {
                responseTerms.push(...messageAttachments);
            }

            responseMessages.push(responseTerms.length === 1 ? responseTerms.shift() : responseTerms);
        });

        return responseMessages;
    }
};