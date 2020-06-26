var express = require('express');
var router = express.Router();

const triggerService = require('../../../services/trigger.service');

/* GET triggers */
router.get('/triggers', async (req, res, next) => {
    const guildId = req.query.guildId;
	res.json(guildId ? await triggerService.getRows(guildId) : []);
});

/* POST a trigger */
router.post('/triggers', async (req, res, next) => {
    const addObj = req.body;
    const { id } = await triggerService.addResponse(addObj.guildId, addObj.trigger, addObj.response);
    const newObj = Object.assign({id}, addObj);
    res.status(201).json(newObj);
});

/* PUT a trigger */
router.put('/triggers/:id', async (req, res, next) => {
    const id = req.params.id;
    const updateObj = req.body;
    await triggerService.update(id, updateObj)
    res.sendStatus(200);
});

/* DELETE a trigger */
router.delete('/triggers/:id', async (req, res, next) => {
    await triggerService.remove(req.params.id)
    res.sendStatus(200);
});

module.exports = router;