const sinon = require('sinon');
const assert = require('assert');
const { expect, assert: chaiAssert } = require('chai');

const config = require('../configuration/bot.config.json');
const strings = require('../configuration/strings.json');
const Discord = require('discord.js');
const CommandHandler = require('./command.handler');
const logger = require('../services/logger.service');

const sandbox = sinon.createSandbox();

describe('command-message-handler', () => {
    const mockUdResponse = {
        list: [
            {
                definition: '1. A [hard disk] drive of a computer or other [electronic device]. \r\n' +
                'The drive is magnetic, as opposed to a disc, which is [optical], such as a CD or DVD or similar media.',
                permalink: 'http://disk.urbanup.com/1765473',
                thumbs_up: 22,
                sound_urls: [],
                author: 'Alex Bahder',
                word: 'disk',
                defid: 1765473,
                current_vote: '',
                written_on: '2006-05-21T00:00:00.000Z',
                example: 'I [downloaded] [so much] [anime], my disk is almost full!',
                thumbs_down: 8
            }
        ]
    };

    global.fetch = sinon.stub();

    beforeEach(() => {
        sandbox.stub(logger, 'error');
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should be created', () => {
        assert.ok(CommandHandler);
    });

    it('should do nothing if no command is present', async () => {
        // Arrange
        const message = 'responses arg1';
        
        // Act
        const response = await CommandHandler.handleMessage(message);

        // Assert
        assert.ifError(response);
    });

    describe(`${config.commandPrefix}urban`, () => {
        it('should fail with no args', async () => {
            // Arrange
            const message = `${config.commandPrefix}urban`;
            
            // Act
            const response = await CommandHandler.handleMessage(message);

            // Assert
            assert.ok(response);
            expect(response).includes(strings.urbandictionary_search_no_term);
        });

        it('should return an embeded response', async () => {
            // Arrange
            const message = `${config.commandPrefix}urban arg1`;
            global.fetch = sinon.stub().returns(Promise.resolve({json: () => Promise.resolve(mockUdResponse)}));
            
            // Act
            const response = await CommandHandler.handleMessage(message);

            // Assert
            assert.ok(response);
            response.forEach(x => chaiAssert.instanceOf(x, Discord.MessageEmbed))
        });

        it('should handle 0 result queries', async () => {
            // Arrange
            const message = `${config.commandPrefix}urban arg1`;
            global.fetch = sinon.stub().returns(Promise.resolve({json: () => Promise.resolve({list: []})}));
            
            // Act
            const response = await CommandHandler.handleMessage(message);

            // Assert
            assert.ok(response);
            expect(response).includes(`No results found for **arg1**.`);
        });

        it('should return failed message if UD integration fails', async () => {
            // Arrange
            const message = `${config.commandPrefix}urban arg1`;
            global.fetch = sinon.stub().throws();
            
            // Act
            const response = await CommandHandler.handleMessage(message);

            // Assert
            assert.ok(response);
            expect(response).includes('Failed trying to talk to Urban Dictionary :cry:');
        });
    });
});