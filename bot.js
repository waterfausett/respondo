const optionalRequire = require("optional-require")(require);
const Discord = require('discord.js');
const logger = require('./app/services/logger.service');
const config = require('./app/configuration/bot.config.json');
const auth = optionalRequire('./app/configuration/auth.config.json') || {};
const strings = require('./app/configuration/strings.json');
const BotMessageHandler = require('./app/message-handlers/bot-message-handler');
const CommandMessageHandler = require('./app/message-handlers/command-message-handler');
const ResponseMessageHandler = require('./app/message-handlers/response-message-handler');

global.fetch = require('node-fetch');

// Initialize Discord Bot
const bot = new Discord.Client();

bot.once('ready', () => {
    logger.info('Connected');
    logger.info('Logged in as: '+ bot.user.username + ' - (' + bot.user.id + ')');
});

bot.on('message', async (message) => {
    if (message.author.bot) return;

    try {
        const botMentionPattern = new RegExp(`<@.?${bot.user.id}>`)
        const botMention = message.mentions.users.has(bot.user.id) || message.content.match(botMentionPattern);
        
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
            responseMessages = botMention
                ? await BotMessageHandler.handleMessage(cleanMessage, guildId)
                : await CommandMessageHandler.handleMessage(cleanMessage)
                    .then(results => results || ResponseMessageHandler.handleMessage(cleanMessage, guildId));
        }

        sendMessages(message, responseMessages);
    } catch (error) {
        console.log(error);
        
        logger.error(`Failed to process a message: ${message.content}\n`, error);
        sendMessages(message, [strings.error]);
    }
});

bot.on('disconnect', function(errMsg, code) { 
    logger.warn('Disconnected');
    logger.warn(errMsg, code);
});

bot.on('error', function(errMsg, code) { 
    logger.warn('Error');
    logger.warn(errMsg, code);
});

async function processDirectMessage(message) {
}

function sendMessages(message, responseMessages, interval = (process.env.simulate_typing || config.simulateTyping) ? 1000 : 10) {
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

bot.login(process.env.auth_token || auth.token);

module.exports = bot;