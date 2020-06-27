const optionalRequire = require("optional-require")(require);
const Discord = require('discord.io');
const logger = require('./app/services/logger.service');
const config = require('./app/configuration/bot.config.json');
const auth = optionalRequire('./app/configuration/auth.config.json') || {};
const strings = require('./app/configuration/strings.json');
const BotMessageHandler = require('./app/message-handlers/bot-message-handler');
const ResponseMessageHandler = require('./app/message-handlers/response-message-handler');

// Initialize Discord Bot
var bot = new Discord.Client({
   token: process.env.auth_token || auth.token,
   autorun: true
});

bot.on('ready', (evt) => {
    logger.info('Connected');
    logger.info('Logged in as: '+ bot.username + ' - (' + bot.id + ')');
});

bot.on('message', async (user, userID, channelId, message, evt) => {
    if (userID === bot.id) return;

    try {
        const guildId = evt.d.guild_id;
        const botMentionPattern = new RegExp(`<@.?${bot.id}>`)
        const botMention = evt.d.mentions.some(x => x.id == bot.id) || message.match(botMentionPattern);
        
        const messageArgs = message
            .split(' ') // split into array of words
            .filter(x => !x.match(botMentionPattern)) // filters out bot mentions
            .join(' '); // put the sentence back together
    
        const responseMessages = botMention
            ? await BotMessageHandler.handleMessage(messageArgs, guildId)
            : await ResponseMessageHandler.handleMessage(messageArgs, guildId);
    
        sendMessages(channelId, responseMessages);
    } catch (error) {
        logger.error('Failed to process a message: ', {message, error});
        sendMessages(channelId, [{message: strings.error}]);
    }
});

bot.on('disconnect', function(errMsg, code) { 
    logger.warn('Disconnected');
    logger.warn(errMsg, code);
});

function sendMessages(channelId, messages, interval = config.simulateTyping ? 1000 : 0) {
    messages = (messages || []).slice(0, config.maximumResponsesPerMessage);

    if (config.simulateTyping && messages.length > 0) bot.simulateTyping(channelId);

    function _sendMessages() {
        setTimeout(() => {
            if (messages[0]) {

                const msg = messages.shift();
                bot.sendMessage({
                    to: channelId,
                    message: msg.message,
                    embed: msg.embed
                });
                _sendMessages();
            }
        }, interval);
    }
    _sendMessages();
}