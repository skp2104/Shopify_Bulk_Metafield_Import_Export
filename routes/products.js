const express = require('express');
const exportMetafield = require('../controllers/exportMetafield');
const createMetafieldDefinition = require('../controllers/createMetafieldDefinition');
const createMetafieldValue = require('../controllers/createMetafieldValue');
const updateMetafieldValue = require('../controllers/updateMetafieldValue');
const readWriteJsonlData = require('../controllers/readWriteJsonlData');
const bulkUpdateMetafieldValue = require('../controllers/bulkUpdateMetafieldValue');
const router = express.Router();

router.get('/exportmetafield', exportMetafield);
router.get('/createmetafield', createMetafieldDefinition);
router.get('/createmetafieldvalue', createMetafieldValue);
router.get('/updatemetafieldvalue', updateMetafieldValue);
router.get('/readwritejsonldata', readWriteJsonlData);
router.get('/bulkupdatemetafieldvalue', bulkUpdateMetafieldValue);

module.exports = router;
