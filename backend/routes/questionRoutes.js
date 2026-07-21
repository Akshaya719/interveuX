const express = require('express');
const { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const { authMiddleware, interviewerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getQuestions);
router.get('/:id', authMiddleware, getQuestion);
router.post('/', authMiddleware, interviewerOnly, createQuestion);
router.put('/:id', authMiddleware, interviewerOnly, updateQuestion);
router.delete('/:id', authMiddleware, interviewerOnly, deleteQuestion);

module.exports = router;
