const express = require('express');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.put('/read-all', authMiddleware, markAllAsRead);
router.put('/:id/read', authMiddleware, markAsRead);

module.exports = router;
