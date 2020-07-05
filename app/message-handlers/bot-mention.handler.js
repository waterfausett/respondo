const Discord = require('discord.js');
const config = require('../configuration/bot.config.json');
const strings = require('../configuration/strings.json');
const logger = require('../services/logger.service');
const triggerService = require('../services/trigger.service');

async function getTriggers(guildId) {
    const guildTriggers = await triggerService.getTriggers(guildId);
    const keys = Object.keys(guildTriggers);

    if (keys.length === 0) return [strings.triggers_none];

    var triggersResponse = '';
    keys.forEach(key => {
        triggersResponse += `${key} \`${guildTriggers[key]}\`\n`;
    });

    const embed = new Discord.MessageEmbed()
        .setTitle(strings.triggers_list)
        .setDescription(triggersResponse);

    return [embed];
}

async function searchResponses(guildId, args) {
    if (args.length === 0) return [strings.responses_search_no_term];

    const guildResponses = await triggerService.searchResponses(guildId, args);
    const keys = Object.keys(guildResponses);
    const embed = new Discord.MessageEmbed()
        .setTitle(strings.responses_search)
        .setDescription(strings.responses_multiple_disclaimer);

    if (keys.length === 0) return [strings.triggers_none];

    keys.forEach(key => {
        let value = '';
        guildResponses[key].forEach(response => {
            value += response.toLowerCase().startsWith('http')
                ? `- <${response}>\n`
                : `- ${response}\n`;
        });
        embed.addField(key, value);
    });

    return [embed];
}

async function addResponse(guildId, args) {
    try {
        await triggerService.addResponse(guildId, args[0].toLowerCase(), args[1]);
        return [strings.got_it];
    }
    catch (err) {
        if (err && err.constraint === 'UX_Trigger_Response_GuildId') {
            return [strings.trigger_already_exists];
        }
        throw err;
    }
}

async function removeTrigger(guildId, trigger) {
    await triggerService.removeTrigger(guildId, trigger.toLowerCase());

    return [strings.got_it];
}

async function removeResponse(guildId, args) {
    // remove an entire trigger
    if (args.length === 1) {
        return removeTrigger(guildId, args[0]);
    }

    await triggerService.removeResponse(guildId, args[0].toLowerCase(), args[1]);

    return [strings.got_it];
}

function getHelp() {
    const prefix = process.env.command_prefix || config.commandPrefix;
    const embed = new Discord.MessageEmbed()
        .setTitle(`Here's some info about the commands I understand:`)
        .addFields([
            {
                name: 'triggers',
                value: strings.triggers_help,
                inline: false
            },
            {
                name: 'responses',
                value: strings.responses_help,
                inline: false
            },
            {
                name: 'add',
                value: strings.add_help,
                inline: false
            },
            {
                name: 'remove',
                value: strings.remove_help,
                inline: false
            },
            {
                name: `${prefix}urban`,
                value: strings.command_urban_help.replace('{prefix}', prefix),
                inline: false
            },
            {
                name: 'Notes:',
                value: strings.help_notes,
                inline: false
            }
        ]);

    return Promise.resolve([embed]);
}

module.exports = {
    handleMessage: (message, guildId) => {
        const args = message.trim().split(' ');
        const cmd = args.shift();
    
        const cmdArgs = args.join(' ').split('|').map(x => x.trim()).filter(x => x);

        switch (cmd.trim().toUpperCase()) {
            case 'HELP':
            case '?':
                return getHelp();
            case 'TRIGGERS':
                return getTriggers(guildId);
            case 'RESPONSES':
                return searchResponses(guildId, cmdArgs);
            case 'ADD':
                return addResponse(guildId, cmdArgs);
            case 'REMOVE':
                return removeResponse(guildId, cmdArgs);
            default: 
                logger.warn('INVALID_REQUEST', {guildId, text: message});
                return Promise.resolve([strings.invalid_request]);
        }
    }
};