const winston = require('winston');
const { format, transports } = winston

const isProduction = (process.env.NODE_ENV === 'production');

const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: format.combine(
        isProduction ? format.uncolorize() : format.colorize({ all: true }),
        format.align(),
        format.errors({ stack: true }),
        format.simple(),
    ),
    transports: [
        new transports.Console()
    ]
});

module.exports = logger;