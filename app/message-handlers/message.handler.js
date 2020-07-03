const logger = require('../services/logger.service');
const config = require('../configuration/bot.config.json');
const strings = require('../configuration/strings.json');
const BotMessageHandler = require('./bot-message-handler');
const CommandMessageHandler = require('./command-message-handler');
const ResponseMessageHandler = require('./response-message-handler');

const sendMessages = (message, responseMessages, interval = (process.env.simulate_typing || config.simulateTyping) ? 1000 : 10) => {
    const maximumResponses = process.env.maximum_responses_per_message || config.maximumResponsesPerMessage;
    responseMessages = (responseMessages || []).filter(x => x).slice(0, maximumResponses);
    
    if ((process.env.simulate_typing || config.simulateTyping) && responseMessages.length > 0) message.channel.startTyping();

    const _send = (msg) => {
        message.channel.send(msg)
            .catch(err => {
                logger.error(JSON.stringify(err));
                message.channel.send(strings.error);
            })
            .finally(_ => message.channel.stopTyping());
    };

    function _sendMessages() {
        setTimeout(() => {
            if (responseMessages[0]) {
                const msg = responseMessages.shift();
                if (Array.isArray(msg)) {
                    msg.forEach(x => _send(x));
                }
                else {
                    _send(msg);
                }
            
                _sendMessages();
            }
        }, interval);
    }
    _sendMessages();
}

module.exports = {
    handleMessage: async (botUser, message) => {
        if (message.author.bot) return;

        try {
            const botMentionPattern = new RegExp(`<@.?${botUser.id}>`)
            
            const cleanMessage = message.content
                .split(' ') // split into array of words
                .filter(x => !x.match(botMentionPattern)) // filters out bot mentions
                .join(' '); // put the sentence back together
        
            const guildId = message.guild ? message.guild.id : null;
    
            let responseMessages;
            if (!guildId) {
                responseMessages = await CommandMessageHandler.handleMessage(cleanMessage)
                    .then(results => results || 
                        BotMessageHandler.handleMessage('?')
                            .then(results => [[strings.idk_what_you_mean, ...results]]));
            }
            else {
                const botMention = message.mentions.users.has(botUser.id) || message.content.match(botMentionPattern);
                responseMessages = botMention
                    ? await BotMessageHandler.handleMessage(cleanMessage, guildId)
                    : await CommandMessageHandler.handleMessage(cleanMessage)
                        .then(results => results || ResponseMessageHandler.handleMessage(cleanMessage, guildId));
            }
    
            sendMessages(message, responseMessages);
        } catch (error) {
            logger.error(`Failed to process a message: ${message.content}\n`, error);
            sendMessages(message, [strings.error]);
        }
    }    
}