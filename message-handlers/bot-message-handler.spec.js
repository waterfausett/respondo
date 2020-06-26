const sinon = require('sinon');
const assert = require('assert');
const { expect } = require('chai');

const BotMessageHandler = require('./../message-handlers/bot-message-handler');
const triggerService = require('../services/trigger.service');
const strings = require('./../configuration/strings.json');

let sandbox = sinon.createSandbox();
const _guildId = 'guild1';

describe('bot-message-handler', () => {
    const guildConfig = {
        'trigger1': [
            'trigger1_response1'
        ],
        'trigger2': [
            'trigger2_response1'
        ],
        'trigger3': [
            'trigger3_response1',
            'trigger3_response2'
        ],
        'trigger that is a phrase': [
            'trigger_phrase_response1'
        ]
    };
    let guildTriggers = {
        'trigger1': 1,
        'trigger2': 1,
        'trigger3': 2,
        'trigger that is a phrase': 1
    }

    let mockTriggerService;
    beforeEach(() => {
        mockTriggerService = sandbox.mock(triggerService);
    });

    afterEach(function () {
        sandbox.verifyAndRestore();
    });

    it('should be created', () => {
        assert.ok(BotMessageHandler);
    });

    describe('getTriggers', () => {
        it('should return triggers', async () => {
            // Arrange
            const message = 'triggers';
            mockTriggerService.expects('getTriggers').returns(guildTriggers)
            
            // Act
            const response = await BotMessageHandler.handleMessage(message, _guildId);

            // Assert
            assert.ok(response);
            expect(response).not.deep.includes({message: strings.triggers_none});
        });
    });

    describe('getResponses', () => {
        it('should return responses', async () => {
            // Arrange
            const message = 'responses';
            mockTriggerService.expects('getResponses').returns(guildConfig);
            
            // Act
            const response = await BotMessageHandler.handleMessage(message, _guildId);

            // Assert
            assert.ok(response);
            expect(response).not.deep.includes({message: strings.triggers_none});
        });
    });

    describe('addResponse', () => {
        it('should add response', async () => {
            // Arrange
            const message = "add hello | world";
            mockTriggerService.expects('addResponse').returns({isAllowed: true});
            
            // Act
            const response = await BotMessageHandler.handleMessage(message, _guildId);

            // Assert
            assert.ok(response);
            expect(response).deep.includes({message: strings.got_it});
        });

        it('should fail for duplicates', async () => {
            // Arrange
            const message = 'add hello | world';
            mockTriggerService.expects('addResponse').returns({isAllowed: false});

            // Act
            const response = await BotMessageHandler.handleMessage(message, _guildId);

            // Assert
            assert.ok(response);
            expect(response).deep.includes({message: strings.trigger_already_exists});
        });
    });

    describe('removeResponse', () => {
        it('should remove response', async () => {
            // Arrange
            const message = 'remove hello | world';
            mockTriggerService.expects('removeResponse');
            mockTriggerService.expects('removeTrigger').never();
            
            // Act
            const response = await BotMessageHandler.handleMessage(message, _guildId);

            // Assert
            assert.ok(response);
            expect(response).deep.includes({message: strings.got_it});

        });
    });

    describe('removeTrigger', () => {
        it('should remove trigger', async () => {
            // Arrange
            const message = 'remove hello';
            mockTriggerService.expects('removeTrigger');
            mockTriggerService.expects('removeResponse').never();
            
            // Act
            const response = await BotMessageHandler.handleMessage(message, _guildId);

            // Assert
            assert.ok(response);
            expect(response).deep.includes({message: strings.got_it});
        });
    });
});