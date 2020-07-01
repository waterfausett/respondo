const winston = require('winston');
const { format, transports } = winston

const logger = winston.createLogger({
    level:  (process.env.NODE_ENV === 'production') ? 'info' : 'debug',
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple(),
            )
        })
    ]
});

module.exports = logger;