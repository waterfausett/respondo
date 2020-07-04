const sinon = require('sinon');
const { expect, assert } = require('chai');

const GuildMessageHandler = require('./guild-message.handler');

const logger = require('../services/logger.service');
const CommandHanlder = require('./command.handler');
const ResponseHandler = require('./response.handler');

let sandbox = sinon.createSandbox();

describe('direct-message.handler', () => {
    const guildId = '1234';

    let mockCommandHandler,
        mockResponseHandler;

    beforeEach(() => {
        sandbox.stub(logger, 'error');

        mockCommandHandler = sandbox.mock(CommandHanlder);
        mockResponseHandler = sandbox.mock(ResponseHandler);
    });

    afterEach(function () {
        sandbox.verifyAndRestore();
    });

    it('should be created', () => {
        assert.ok(GuildMessageHandler);
    });

    it(`should respond to commands`, async () => {
        // Arrange
        const message = '!recognizedCommand action';
        mockCommandHandler.expects('handleMessage').returns(['command_result']);
        mockResponseHandler.expects('handleMessage').never();
        
        // Act
        const results = await GuildMessageHandler.handleMessage(message, guildId);

        // Assert
        assert.ok(results);
        expect(results).deep.includes('command_result');
    });

    it(`should check for responses if no command matches are found`, async () => {
        // Arrange
        const message = 'trigger1';
        mockCommandHandler.expects('handleMessage');
        mockResponseHandler.expects('handleMessage').returns(['response1']);
        
        // Act
        const results = await GuildMessageHandler.handleMessage(message, guildId);

        // Assert
        assert.ok(results);
        assert.isAtLeast(results.length, 1);
        expect(results[0]).deep.includes('response1');
    });
});