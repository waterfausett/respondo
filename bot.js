const optionalRequire = require("optional-require")(require);
const Discord = require('discord.js');
const logger = require('./app/services/logger.service');
const config = require('./app/configuration/bot.config.json');
const auth = optionalRequire('./app/configuration/auth.config.json') || {};
const strings = require('./app/configuration/strings.json');
const BotMessageHandler = require('./app/message-handlers/bot-message-handler');
const ResponseMessageHandler = require('./app/message-handlers/response-message-handler');

// Initialize Discord Bot
const bot = new Discord.Client();

bot.once('ready', () => {
    logger.info('Connected');
    logger.info('Logged in as: '+ bot.user.username + ' - (' + bot.user.id + ')');
});

bot.on('message', async (message) => {
    if (message.author.bot) return;

    //if (message.author.id == '618612104102019074') return;

    try {
        const guildId = message.guild.id;
        const botMentionPattern = new RegExp(`<@.?${bot.user.id}>`)
        const botMention = message.mentions.users.has(bot.user.id) || message.content.match(botMentionPattern);
        
        const messageArgs = message.content
            .split(' ') // split into array of words
            .filter(x => !x.match(botMentionPattern)) // filters out bot mentions
            .join(' '); // put the sentence back together
    
        const responseMessages = botMention
            ? await BotMessageHandler.handleMessage(messageArgs, guildId)
            : await ResponseMessageHandler.handleMessage(messageArgs, guildId);

        sendMessages(message, responseMessages);
    } catch (error) {
        logger.error('Failed to process a message: ', {message, error});
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

function sendMessages(message, responseMessages, interval = config.simulateTyping ? 1000 : 0) {
    responseMessages = (responseMessages || []).slice(0, config.maximumResponsesPerMessage);

    if (config.simulateTyping && responseMessages.length > 0) message.channel.startTyping();

    function _sendMessages() {
        setTimeout(() => {
            if (responseMessages[0]) {
                const msg = responseMessages.shift();
                // TODO: prolly should try and trim the response here - i think Discord only allows up-to 2000 chars
                message.channel.send(msg)
                    .catch(err => logger.error(JSON.stringify(err)))
                    .finally(_ => message.channel.stopTyping());
            
                _sendMessages();
            }
        }, interval);
    }
    _sendMessages();
}

bot.login(process.env.auth_token || auth.token);
