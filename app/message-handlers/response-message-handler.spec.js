const sinon = require('sinon');
const assert = require('assert');
const { expect } = require('chai');

const ResponseMessageHandler = require('./response-message-handler');
const triggerService = require('../services/trigger.service');

let sandbox = sinon.createSandbox();
const _guildId = 'guild1';

describe('response-message-handler', () => {
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
        'trigGeR4': [
            'trigger4_ReSpOnSe1'
        ],
        'trigger that is a phrase': [
            'trigger_phrase_response1'
        ]
    };

    beforeEach(() => {
        sandbox.stub(triggerService, 'getResponses').returns(guildConfig);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should be created', () => {
        assert.ok(ResponseMessageHandler);
    });

    ['trigger1', ' trigger1 ', 'trigger1?', 'trigger1 test', 'test trigger1', 'another trigger1 test', 'trigger4',
    'TRIGGER1', 'TrIGgEr1', 'some-trigger1', 'trigger1-thing', 'this is a trigger that is a phrase, bet you did not see that comeing']
        .forEach((message) => {
            it(`should recognize triggers: ${message}`, async () => {
                // Act
                const messages = await ResponseMessageHandler.handleMessage(message, _guildId);

                // Assert
                assert.ok(messages);
                expect(messages.length).greaterThan(0);
            });
        });

    ['', ' ', 'sometrigger1 test', 'test trigger1thing', 'another sometrigger1thing test', 'this is a trigger that has a phrase']
        .forEach((message) => {
            it(`should not have false positives: ${message}`, async () => {
                // Act
                const messages = await ResponseMessageHandler.handleMessage(message, _guildId);

                // Assert
                assert.ok(messages);
                expect(messages.length).equal(0);
            });
        });

    [
        { message: 'trigger1', expectedResponses: ['trigger1_response1'] },
        { message: 'trigger2', expectedResponses: ['trigger2_response1'] },
        { message: 'trigger that is a phrase', expectedResponses: ['trigger_phrase_response1'] },
        { message: 'trigger1 trigger2', expectedResponses: ['trigger1_response1', 'trigger2_response1'] },
        { message: 'trigger4', expectedResponses: ['trigger4_ReSpOnSe1'] },
    ]
    .forEach((testInput) => {
        it(`should return an appropriate response: ${testInput.message}`, async () => {
            // Act
            const messages = await ResponseMessageHandler.handleMessage(testInput.message, _guildId);

            // Assert
            assert.ok(messages);
            expect(messages.length).equal(testInput.expectedResponses.length);
            testInput.expectedResponses.forEach(expectedResponse => expect(messages).deep.includes({message: expectedResponse}));
        });
    });

    it('should return one of a list of configured responses', async () => {
        // Arrange
        const trigger = 'trigger3';
        var message = `this message should ${trigger} one of a random set`;

        // Act
        const messages = await ResponseMessageHandler.handleMessage(message, _guildId);

        // Assert
        assert.ok(messages);
        expect(messages.length).equal(1);
        expect(guildConfig[trigger]).contains(messages[0].message);
    });
});