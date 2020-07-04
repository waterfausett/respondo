const sinon = require('sinon');
const { expect, assert } = require('chai');

const DirectMessageHandler = require('./direct-message.handler');

const logger = require('../services/logger.service');
const strings = require('../configuration/strings.json');
const BotMentionHandler = require('./bot-mention.handler');
const CommandHanlder = require('./command.handler');

let sandbox = sinon.createSandbox();

describe('direct-message.handler', () => {
    let mockBotMentionHandler,
        mockCommandHandler;

    beforeEach(() => {
        sandbox.stub(logger, 'error');

        mockBotMentionHandler = sandbox.mock(BotMentionHandler);
        mockCommandHandler = sandbox.mock(CommandHanlder);
    });

    afterEach(function () {
        sandbox.verifyAndRestore();
    });

    it('should be created', () => {
        assert.ok(DirectMessageHandler);
    });

    it(`should respond to commands`, async () => {
        // Arrange
        const message = '!recognizedCommand action';
        mockCommandHandler.expects('handleMessage').returns(['command_result']);
        mockBotMentionHandler.expects('handleMessage').never();
        
        // Act
        const results = await DirectMessageHandler.handleMessage(message);

        // Assert
        assert.ok(results);
        expect(results).deep.includes('command_result');
    });

    ['help', 'HeLp', '?', '??']
        .forEach(message => {
            it(`should offer help: '${message}'`, async () => {
                // Arrange
                mockCommandHandler.expects('handleMessage');
                mockBotMentionHandler.expects('handleMessage').returns(['help_response']);
                
                // Act
                const results = await DirectMessageHandler.handleMessage(message);
        
                // Assert
                assert.ok(results);
                expect(results).deep.includes('help_response');
            });
        });

    it(`should give advice if the message is not understood`, async () => {
        // Arrange
        const message = 'some not recognized DM';
        mockCommandHandler.expects('handleMessage');
        mockBotMentionHandler.expects('handleMessage').never();
        
        // Act
        const results = await DirectMessageHandler.handleMessage(message);

        // Assert
        assert.ok(results);
        assert.isAtLeast(results.length, 1);
        expect(results[0]).deep.includes(strings.idk_what_you_mean);
    });
});