const logger = require('../services/logger.service');
const CommandHandler = require('./command.handler');
const ResponseHandler = require('./response.handler');

module.exports = {
    handleMessage: async (message, guildId) => {
        const results = await CommandHandler.handleMessage(message);
        return results || ResponseHandler.handleMessage(message, guildId);
    }
}