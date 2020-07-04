const sinon = require('sinon');
const { expect, assert } = require('chai');

const MessageHandler = require('./message.handler');

const Discord = require('discord.js');
const logger = require('../services/logger.service');
const config = require('../configuration/bot.config.json');
const strings = require('../configuration/strings.json');
const BotMentionHandler = require('./bot-mention.handler');
const DirectMessageHandler = require('./direct-message.hanlder');
const GuildMessageHanlder = require('./guild-message.handler');

let sandbox = sinon.createSandbox();

describe.only('message.handler', () => {
    const botUser = { id: '123456' };

    let mockBotMentionHandler,
        mockDirectMessageHandler,
        mockGuildMessageHandler;

    let message;
    let clock;

    beforeEach(() => {
        sandbox.stub(logger, 'error');

        clock = sandbox.useFakeTimers();

        mockBotMentionHandler = sandbox.mock(BotMentionHandler);
        mockGuildMessageHandler = sandbox.mock(GuildMessageHanlder);
        mockDirectMessageHandler = sandbox.mock(DirectMessageHandler);

        message = {
            content: '',
            author: { bot: false },
            guild: { id: '654321' },
            mentions1: {
                has: sinon.stub().returns(false)
            },
            mentions: sandbox.createStubInstance(Discord.MessageMentions, {

            }),
            channel: {
                startTyping: sinon.spy(),
                stopTyping: sinon.spy(),
                send: sinon.stub().resolves()
            }
        }
    });

    afterEach(function () {
        sandbox.verifyAndRestore();
    });

    it('should be created', () => {
        assert.ok(MessageHandler);
    });

    it(`should skip bot messages`, async () => {
        // Arrange
        message.author.bot = true;
        
        // Act
        await MessageHandler.handleMessage(botUser, message);

        // Assert
        assert.isTrue(message.channel.send.notCalled);
    });

    it('should return an error message on failure', async () => {
        // Assert
        mockGuildMessageHandler.expects('handleMessage').throws();

        // Act
        await MessageHandler.handleMessage(botUser, message);
        clock.runAll();

        // Assert
        assert.isTrue(message.channel.send.withArgs(strings.error).called);
    })

    describe('direct messages', () => {
        it(`should handle as DM when no guild is present`, async () => {
            // Arrange
            message.guild = null;
            mockDirectMessageHandler.expects('handleMessage');
            mockBotMentionHandler.expects('handleMessage').never();
            mockGuildMessageHandler.expects('handleMessage').never();
            
            // Act
            await MessageHandler.handleMessage(botUser, message);
        });

        it(`should send a message if returned`, async () => {
            // Arrange
            message.guild = null;
            mockDirectMessageHandler.expects('handleMessage').returns(['response']);
            mockBotMentionHandler.expects('handleMessage').never();
            mockGuildMessageHandler.expects('handleMessage').never();
            
            // Act
            await MessageHandler.handleMessage(botUser, message);
            clock.runAll();

            // Assert
            assert.isTrue(message.channel.send.called);
        });

        it(`should not send a message if nothing returned`, async () => {
            // Arrange
            message.guild = null;
            mockDirectMessageHandler.expects('handleMessage');
            mockBotMentionHandler.expects('handleMessage').never();
            mockGuildMessageHandler.expects('handleMessage').never();
            
            // Act
            await MessageHandler.handleMessage(botUser, message);

            // Assert
            assert.isTrue(message.channel.send.notCalled);
        });
    });

    describe('bot mentions', () => {
        it(`should handle as BotMention when the bot is mentioned (mentions)`, async () => {
            // Arrange
            message.mentions.has = sandbox.stub().returns(true);
            mockBotMentionHandler.expects('handleMessage');
            mockDirectMessageHandler.expects('handleMessage').never();
            mockGuildMessageHandler.expects('handleMessage').never();
            
            // Act
            await MessageHandler.handleMessage(botUser, message);

            // Assert
            assert.isTrue(message.channel.send.notCalled);
        });

        it(`should handle as BotMention when the bot is mentioned (regex)`, async () => {
            // Arrange
            message.content = `<@!${botUser.id}>`;
            mockBotMentionHandler.expects('handleMessage');
            mockDirectMessageHandler.expects('handleMessage').never();
            mockGuildMessageHandler.expects('handleMessage').never();
            
            // Act
            await MessageHandler.handleMessage(botUser, message);

            // Assert
            assert.isTrue(message.channel.send.notCalled);
        });

        it(`should send a message if returned`, async () => {
            // Arrange
            message.mentions.has = sinon.stub().returns(true);
            mockBotMentionHandler.expects('handleMessage').returns(['response']);
            mockDirectMessageHandler.expects('handleMessage').never();
            mockGuildMessageHandler.expects('handleMessage').never();
            
            // Act
            await MessageHandler.handleMessage(botUser, message);
            clock.runAll();

            // Assert
            assert.isTrue(message.channel.send.called);
        });

        it(`should not send a message if nothing returned`, async () => {
            // Arrange
            message.mentions.has = sinon.stub().returns(true);
            mockBotMentionHandler.expects('handleMessage');
            mockDirectMessageHandler.expects('handleMessage').never();
            mockGuildMessageHandler.expects('handleMessage').never();
            
            // Act
            await MessageHandler.handleMessage(botUser, message);

            // Assert
            assert.isTrue(message.channel.send.notCalled);
        });
    });

    describe('guild messages', () => {
        it(`should handle as GuildMessage when appropriate`, async () => {
            // Arrange
            mockGuildMessageHandler.expects('handleMessage');
            mockDirectMessageHandler.expects('handleMessage').never();
            mockBotMentionHandler.expects('handleMessage').never();
            
            // Act
            await MessageHandler.handleMessage(botUser, message);
        });

        it(`should send a message if returned`, async () => {
            // Arrange
            mockGuildMessageHandler.expects('handleMessage').returns(['response']);
            mockDirectMessageHandler.expects('handleMessage').never();
            mockBotMentionHandler.expects('handleMessage').never();
            
            // Act
            await MessageHandler.handleMessage(botUser, message);
            clock.runAll();

            // Assert
            assert.isTrue(message.channel.send.called);
        });

        it(`should not send a message if nothing returned`, async () => {
            // Arrange
            mockGuildMessageHandler.expects('handleMessage');
            mockDirectMessageHandler.expects('handleMessage').never();
            mockBotMentionHandler.expects('handleMessage').never();
            
            // Act
            await MessageHandler.handleMessage(botUser, message);

            // Assert
            assert.isTrue(message.channel.send.notCalled);
        });
    });
});