const sinon = require('sinon');
const assert = require('assert');
const { expect } = require('chai');

const BotMessageHandler = require('./bot-message-handler');
const triggerService = require('../services/trigger.service');
const strings = require('../configuration/strings.json');

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
        'trigger that is a phrase':  [
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
        [
            {command: 'add', trigger: 'hello', response: 'world'},
            {command: 'add', trigger: 'hello', response: 'wOrLd'},
            {command: 'AdD', trigger: 'hello', response: 'world'},
            {command: 'add', trigger: 'HeLlo', response: 'world'},
        ].forEach((testInput) => {
            it('should add response', async () => {
                // Arrange
                const message = `${testInput.command} ${testInput.trigger} | ${testInput.response}`;
                mockTriggerService.expects('addResponse')
                    .withArgs(_guildId, testInput.trigger.toLowerCase(), testInput.response)
                    .returns(123);
                
                // Act
                const response = await BotMessageHandler.handleMessage(message, _guildId);

                // Assert
                assert.ok(response);
                expect(response).deep.includes({message: strings.got_it});
            });
        });

        it('should fail for duplicates', async () => {
            // Arrange
            const message = 'add hello | world';
            mockTriggerService.expects('addResponse').throws({constraint: 'UX_Trigger_Response_GuildId'});

            // Act
            const response = await BotMessageHandler.handleMessage(message, _guildId);

            // Assert
            assert.ok(response);
            expect(response).deep.includes({message: strings.trigger_already_exists});
        });
    });

    describe('removeResponse', () => {
        [
            {command: 'remove', trigger: 'hello', response: 'world'},
            {command: 'remove', trigger: 'hello', response: 'wOrLd'},
            {command: 'ReMoVe', trigger: 'hello', response: 'world'},
            {command: 'remove', trigger: 'HeLlo', response: 'world'},
        ].forEach((testInput) => {
            it('should remove response', async () => {
                // Arrange
                const message = `${testInput.command} ${testInput.trigger} | ${testInput.response}`;
                mockTriggerService.expects('removeResponse').withArgs(_guildId, testInput.trigger.toLowerCase(), testInput.response);
                mockTriggerService.expects('removeTrigger').never();
                
                // Act
                const response = await BotMessageHandler.handleMessage(message, _guildId);

                // Assert
                assert.ok(response);
                expect(response).deep.includes({message: strings.got_it});

            });
        });
    });

    describe('removeTrigger', () => {
        [
            {command: 'remove', trigger: 'hello'},
            {command: 'ReMoVe', trigger: 'hello'},
            {command: 'remove', trigger: 'HeLlo'},
        ].forEach((testInput) => {
            it('should remove trigger', async () => {
                // Arrange
                const message = `${testInput.command} ${testInput.trigger}`;
                mockTriggerService.expects('removeTrigger').withArgs(_guildId, testInput.trigger.toLowerCase());
                mockTriggerService.expects('removeResponse').never();
                
                // Act
                const response = await BotMessageHandler.handleMessage(message, _guildId);
    
                // Assert
                assert.ok(response);
                expect(response).deep.includes({message: strings.got_it});
            });
        });
    });
});