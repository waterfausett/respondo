const optionalRequire = require("optional-require")(require);
const Discord = require('discord.js');
const logger = require('./app/services/logger.service');
const auth = optionalRequire('./app/configuration/auth.config.json') || {};
const MessageHandler = require('./app/message-handlers/message.handler');

global.fetch = require('node-fetch');

// Initialize Discord Bot
const bot = new Discord.Client();

bot.once('ready', () => {
    logger.info('Connected');
    logger.info('Logged in as: '+ bot.user.username + ' - (' + bot.user.id + ')');
});

bot.on('message', (message) => MessageHandler.handleMessage(bot.user, message));

bot.on('disconnect', function(errMsg, code) { 
    logger.warn('Disconnected');
    logger.warn(errMsg, code);
});

bot.on('error', function(errMsg, code) { 
    logger.warn('Error');
    logger.warn(errMsg, code);
});

bot.login(process.env.auth_token || auth.token);

module.exports = bot;