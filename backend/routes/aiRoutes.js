const express = require('express');
const { analyzeCode } = require('../controllers/aiController');

const router = express.Router();

router.post('/analyze', analyzeCode);

module.exports = router;
