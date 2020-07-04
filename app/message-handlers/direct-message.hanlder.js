const logger = require('../services/logger.service');
const strings = require('../configuration/strings.json');
const BotMentionHandler = require('./bot-mention.handler');
const CommandHandler = require('./command.handler');

module.exports = {
    handleMessage: async (message) => {
        const results = await CommandHandler.handleMessage(message);
        return results ||
            BotMentionHandler.handleMessage('?')
                .then(help => [[strings.idk_what_you_mean, ...help]]);
    }
}