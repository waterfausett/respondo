const strings = require('../../configuration/strings.json');
const logger = require('../../logger');
const triggerService = require('../../services/trigger.service');

async function getTriggers(guildId) {
    const guildTriggers = await triggerService.getTriggers(guildId);
    const keys = Object.keys(guildTriggers);

    if (keys.length === 0) return [{message: strings.triggers_none}];

    var triggersResponse = '';
    keys.forEach(key => {
        triggersResponse += `${key} \`${guildTriggers[key]}\`\n`;
    });

    return [{
        message: strings.triggers_list,
        embed: {
            description: triggersResponse
        }
    }];
}

async function getResponses(guildId) {
    const guildResponses = await triggerService.getResponses(guildId);
    const keys = Object.keys(guildResponses);
    const fields = [];

    if (keys.length === 0) return [{message: strings.triggers_none}];

    keys.forEach(key => {
        var field = {
            name: key,
            value: '',
            inline: false
        };
        guildResponses[key].responses.forEach(response => {
            const isLink = response.toLowerCase().startsWith('http');
            field.value += isLink
                ? `- <${response}>\n`
                : `- ${response}\n`;
        });
        fields.push(field);
    });

    return [{
        message: strings.responses_list,
        embed: {
            fields: fields
        }
    }];
}

async function addResponse(guildId, args) {
    const { isAllowed } = await triggerService.addResponse(guildId, args[0], args[1]);

    return isAllowed
        ? [{message: strings.got_it}]
        : [{message: strings.trigger_already_exists}];
}

async function removeTrigger(guildId, trigger) {
    await triggerService.removeTrigger(guildId, trigger);

    return [{message: strings.got_it}];
}

async function removeResponse(guildId, args) {
    // remove an entire trigger
    if (args.length === 1) {
        return removeTrigger(guildId, args[0]);
    }

    await triggerService.removeResponse(guildId, args[0], args[1]);

    return [{message: strings.got_it}];
}

function getHelp() {
    return [{
        message: "Hi there :smiley:\nHere's some info about the commands I understand:",
        embed: {
            fields: [
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
                }
            ]
        }
    }];
}

module.exports = {
    handleMessage: (message, guildId) => {
        const args = message.split(' ');
        const cmd = args.shift();
    
        const cmdArgs = args.join(' ').split('|').map(x => x.trim().toLowerCase());

        switch (cmd.trim().toUpperCase()) {
            case 'HELP':
            case '?':
                return getHelp();;
            case 'TRIGGERS':
                return getTriggers(guildId);
            case 'RESPONSES':
                return getResponses(guildId);
            case 'ADD':
                return addResponse(guildId, cmdArgs);
            case 'REMOVE':
                return removeResponse(guildId, cmdArgs);
            default: 
                logger.warn({t: 'INVALID_REQUEST', guildId, message});
                return [{message: strings.invalid_request}];
        }
    }
};