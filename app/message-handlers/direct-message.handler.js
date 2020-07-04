const logger = require('../services/logger.service');
const strings = require('../configuration/strings.json');
const config = require('../configuration/bot.config.json');
const BotMentionHandler = require('./bot-mention.handler');
const CommandHandler = require('./command.handler');

module.exports = {
    handleMessage: async (message) => {
        const results = await CommandHandler.handleMessage(message);
        if (results) return results;
        
        return (message.toLowerCase() === 'help' || message.match(/^\?+$/))
            ? BotMentionHandler.handleMessage('?')
            : [[strings.idk_what_you_mean, `I can only process \`${process.env.command_prefix || config.commandPrefix}\` commands in DMs...\nwell, you can also ask for "help"`]];
    }
}