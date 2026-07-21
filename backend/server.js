require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const executeRoutes = require('./routes/executeRoutes');
const aiRoutes = require('./routes/aiRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const questionRoutes = require('./routes/questionRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const SessionEvent = require('./models/SessionEvent');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notifications', notificationRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Register user for direct notifications
  socket.on('register-user', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} registered for notifications`);
    }
  });

  socket.on('join-session', ({ sessionId, user }) => {
    socket.join(sessionId);
    console.log(`User ${user?.name || socket.id} joined session: ${sessionId}`);
    socket.to(sessionId).emit('user-joined', user);
  });

  socket.on('code-change', async ({ sessionId, code }) => {
    socket.to(sessionId).emit('code-change', code);
    try {
      await SessionEvent.create({ sessionId, eventType: 'CODE_CHANGE', data: code });
    } catch (e) { console.error('Failed to save event', e); }
  });

  socket.on('output-change', async ({ sessionId, output }) => {
    socket.to(sessionId).emit('output-change', output);
    try {
      await SessionEvent.create({ sessionId, eventType: 'EXECUTION_RESULT', data: output });
    } catch (e) { console.error('Failed to save event', e); }
  });

  socket.on('question-changed', async ({ sessionId, question }) => {
    socket.to(sessionId).emit('question-changed', question);
    try {
      await SessionEvent.create({ sessionId, eventType: 'QUESTION_CHANGE', data: { questionId: question._id, title: question.title } });
    } catch (e) { console.error('Failed to save question change event', e); }
  });

  socket.on('language-change', async ({ sessionId, language }) => {
    socket.to(sessionId).emit('language-change', language);
    try {
      await SessionEvent.create({ sessionId, eventType: 'LANGUAGE_CHANGE', data: language });
    } catch (e) { console.error('Failed to save event', e); }
  });

  socket.on('chat-message', async ({ sessionId, text, sender, timestamp }) => {
    socket.to(sessionId).emit('chat-message', { text, sender, timestamp });
    try {
      await SessionEvent.create({ sessionId, eventType: 'CHAT_MESSAGE', data: { text, sender, timestamp } });
    } catch (e) { console.error('Failed to save chat event', e); }
  });

  socket.on('candidate-language', ({ sessionId, language }) => {
    socket.to(sessionId).emit('candidate-language', language);
  });

  socket.on('candidate-status', ({ sessionId, status }) => {
    socket.to(sessionId).emit('candidate-status', status);
  });

  socket.on('interview-end', async ({ sessionId }) => {
    socket.to(sessionId).emit('interview-ended');
    try {
      await SessionEvent.create({ sessionId, eventType: 'INTERVIEW_END', data: {} });
    } catch (e) { console.error('Failed to save event', e); }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
