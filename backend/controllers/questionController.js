const Question = require('../models/Question');

const getQuestions = async (req, res) => {
  try {
    const { search, difficulty } = req.query;
    let filter = {};
    if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.status(200).json(questions);
  } catch (e) { res.status(500).json({ message: 'Failed to fetch questions' }); }
};

const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(question);
  } catch (e) { res.status(500).json({ message: 'Failed to fetch question' }); }
};

const createQuestion = async (req, res) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(question);
  } catch (e) { res.status(500).json({ message: 'Failed to create question', error: e.message }); }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(question);
  } catch (e) { res.status(500).json({ message: 'Failed to update question' }); }
};

const deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Question deleted' });
  } catch (e) { res.status(500).json({ message: 'Failed to delete question' }); }
};

module.exports = { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion };
