const config = require('../configuration/bot.config.json');
const strings = require('../configuration/strings.json');
const Discord = require('discord.js');
const querystring = require('querystring');
const logger = require('../services/logger.service');

const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);

module.exports = {
    handleMessage: async (message) => {
        const cleanMessage = message.trim();
        try {
            const prefix = process.env.command_prefix || config.commandPrefix;

            if (!cleanMessage.startsWith(prefix)) return;
    
            const args = cleanMessage.slice(prefix.length).split(/ +/);
            const command = args.shift().toLowerCase();
    
            if (command === 'urban') {
                if (!args.length) {
                    return [strings.urbandictionary_search_no_term];
                }
                
                const query = querystring.stringify({ term: args.join(' ') });
                const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(response => response.json());
    
                if (!list.length) {
                    return [`No results found for **${args.join(' ')}**.`];
                }
    
                const [answer] = list;
    
                const embed = new Discord.MessageEmbed()
                    .setColor('#173B7D')
                    .setTitle(answer.word)
                    .setURL(answer.permalink)
                    .addFields(
                        { name: 'Definition', value: trim(answer.definition, 1024) },
                        { name: 'Example', value: trim(answer.example, 1024) },
                        { name: 'Rating', value: `:star_struck: \`${answer.thumbs_up}\` :cry: \`${answer.thumbs_down}\`` }
                    );
    
                return [embed];
            }
        }
        catch (error) {
            logger.error('Failed talking to UrbanDictionary: ', error);
            return ['Failed trying to talk to Urban Dictionary :cry:'];
        }
    }
};