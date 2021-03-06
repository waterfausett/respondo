const sinon = require('sinon');
const assert = require('assert');
const { expect } = require('chai');

const BotMentionHandler = require('./bot-mention.handler');
const triggerService = require('../services/trigger.service');
const strings = require('../configuration/strings.json');

let sandbox = sinon.createSandbox();
const _guildId = 'guild1';

describe('bot-mention.handler', () => {
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
        assert.ok(BotMentionHandler);
    });

    describe('getTriggers', () => {
        [
            'triggers',
            ' triggers',
            '  triggers',
            'triggers ',
            'triggers  ',
            '  triggers  '
        ].forEach(message => {
            it(`should return triggers: '${message}'`, async () => {
                // Arrange
                mockTriggerService.expects('getTriggers').returns(guildTriggers)
                
                // Act
                const response = await BotMentionHandler.handleMessage(message, _guildId);
    
                // Assert
                assert.ok(response);
                expect(response).not.deep.includes(strings.triggers_none);
            });
        });
    });

    describe('searchResponses', () => {
        it('should return responses', async () => {
            // Arrange
            const message = 'responses trigger1';
            mockTriggerService.expects('searchResponses').returns(guildConfig);
            
            // Act
            const response = await BotMentionHandler.handleMessage(message, _guildId);

            // Assert
            assert.ok(response);
            expect(response).not.deep.includes(strings.triggers_none);
            expect(response).not.deep.includes(strings.responses_search_no_term);
        });
    });

    describe('addResponse', () => {
        [
            {command: 'add', trigger: 'hello', response: 'world'},
            {command: 'add', trigger: 'hello', response: 'wOrLd'},
            {command: 'AdD', trigger: 'hello', response: 'world'},
            {command: 'add', trigger: 'HeLlo', response: 'world'},
        ].forEach((testInput) => {
            const message = `${testInput.command} ${testInput.trigger} | ${testInput.response}`;
            it(`should add response: '${message}'`, async () => {
                // Arrange
                mockTriggerService.expects('addResponse')
                    .withArgs(_guildId, testInput.trigger.toLowerCase(), testInput.response)
                    .returns(123);
                
                // Act
                const response = await BotMentionHandler.handleMessage(message, _guildId);

                // Assert
                assert.ok(response);
                expect(response).deep.includes(strings.got_it);
            });
        });

        it('should fail for duplicates', async () => {
            // Arrange
            const message = 'add hello | world';
            mockTriggerService.expects('addResponse').throws({constraint: 'UX_Trigger_Response_GuildId'});

            // Act
            const response = await BotMentionHandler.handleMessage(message, _guildId);

            // Assert
            assert.ok(response);
            expect(response).deep.includes(strings.trigger_already_exists);
        });
    });

    describe('removeResponse', () => {
        [
            {command: 'remove', trigger: 'hello', response: 'world'},
            {command: 'remove', trigger: 'hello', response: 'wOrLd'},
            {command: 'ReMoVe', trigger: 'hello', response: 'world'},
            {command: 'remove', trigger: 'HeLlo', response: 'world'},
        ].forEach((testInput) => {
            const message = `${testInput.command} ${testInput.trigger} | ${testInput.response}`;
            it(`should remove response: '${message}'`, async () => {
                // Arrange
                mockTriggerService.expects('removeResponse').withArgs(_guildId, testInput.trigger.toLowerCase(), testInput.response);
                mockTriggerService.expects('removeTrigger').never();
                
                // Act
                const response = await BotMentionHandler.handleMessage(message, _guildId);

                // Assert
                assert.ok(response);
                expect(response).deep.includes(strings.got_it);

            });
        });
    });

    describe('removeTrigger', () => {
        [
            {command: 'remove', trigger: 'hello'},
            {command: 'ReMoVe', trigger: 'hello'},
            {command: 'remove', trigger: 'HeLlo'},
        ].forEach((testInput) => {
            const message = `${testInput.command} ${testInput.trigger}`;
            it(`should remove trigger: '${message}'`, async () => {
                // Arrange
                mockTriggerService.expects('removeTrigger').withArgs(_guildId, testInput.trigger.toLowerCase());
                mockTriggerService.expects('removeResponse').never();
                
                // Act
                const response = await BotMentionHandler.handleMessage(message, _guildId);
    
                // Assert
                assert.ok(response);
                expect(response).deep.includes(strings.got_it);
            });
        });
    });
});