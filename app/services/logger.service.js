const winston = require('winston');
const { format, transports } = winston

const isProduction = (process.env.NODE_ENV === 'production');

const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    transports: [
        new transports.Console({
            format: format.combine(
                isProduction ? format.uncolorize() : format.colorize(),
                format.align(),
                format.simple(),
            )
        })
    ]
});

module.exports = logger;