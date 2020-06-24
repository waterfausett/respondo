const logger = require('../logger');
const TAG = 'Trigger.service';

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

function sqlClean(str) {
    return str.replace(/\'/g, '\'$&');
}

async function executeQuery(query) {
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();
    return result;
}

module.exports = {
    getTriggers: async (guildId) => {
        try {
            const result = await executeQuery(`SELECT trigger FROM "TriggerResponses" WHERE "guildId" = '${guildId}'`);
            const results = (result) 
                ? result.rows.reduce((obj, v) => {
                    obj[v.trigger] = (obj[v.trigger] || 0) + 1;
                    return obj;
                  }, {})
                : {};
            return results;
        } catch (err) {
            logger.error(`${TAG}::getTriggers:`, err);
            throw err;
        }
    },

    getResponses: async (guildId) => {
        try {
            const result = await executeQuery(`SELECT trigger, response FROM "TriggerResponses" WHERE "guildId" = '${guildId}'`);
            const results = (result) 
                ? result.rows.reduce((obj, v) => {
                    obj[v.trigger] = (obj[v.trigger] || []);
                    obj[v.trigger].push(v.response);
                    return obj;
                }, {})
                : {};
            return results;
        } catch (err) {
            logger.error(`${TAG}::getResponses:`, err);
            throw err;
        }
    },

    addResponse: async (guildId, trigger, response) => {
        let isAllowed = true;
        try {
            await executeQuery(`INSERT INTO "TriggerResponses" (trigger, response, "guildId") VALUES ('${sqlClean(trigger)}', '${sqlClean(response)}', '${guildId}')`);
        } catch (err) {
            if (err && err.constraint === 'UX_Trigger_Response_GuildId') {
                logger.warn(`${TAG}::addResponse:`, err);
                isAllowed = false;
            }
            else {
                logger.error(`${TAG}::addResponse:`, err);
                throw err;
            }
        }

        return isAllowed;
    },

    removeResponse: async (guildId, trigger, response) => {
        try {
            await executeQuery(`DELETE FROM "TriggerResponses" WHERE "guildId" = '${guildId}' AND trigger = '${sqlClean(trigger)}' AND response = '${sqlClean(response)}'`);
        } catch (err) {
            logger.error(`${TAG}::removeResponse:`, err);
            throw err;
        }
    },

    removeTrigger: async (guildId, trigger) => {
        try {
            await executeQuery(`DELETE FROM "TriggerResponses" WHERE "guildId" = '${guildId}' AND trigger = '${sqlClean(trigger)}'`);
        } catch (err) {
            logger.error(`${TAG}::removeTrigger:`, err);
            throw err;
        }
    }
};