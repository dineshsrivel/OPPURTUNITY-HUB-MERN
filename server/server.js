const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');
const { ensureAdminExists } = require('./utils/createAdmin');


// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth.routes');
const userRoutes        = require('./routes/user.routes');
const adminRoutes       = require('./routes/admin.routes');
const opportunityRoutes = require('./routes/opportunity.routes');
const applicationRoutes = require('./routes/application.routes');
const notificationRoutes= require('./routes/notification.routes');
const publicRoutes      = require('./routes/public.routes');
const jobRoutes = require('./routes/job.routes');
const internshipRoutes = require("./routes/internship.routes");
const freelancingRoutes = require("./routes/freelancing.routes");
const hackathonRoutes = require("./routes/hackathon.routes");
const scholarshipRoutes = require("./routes/scholarship.routes");

// ── Connect DB & ensure default admin exists ─────────────────────────────────
// Opportunities are managed exclusively via the Admin panel — no auto-seeding.
connectDB().then(() => {
  ensureAdminExists().catch((err) =>
    console.error('⚠️  Admin ensure failed:', err.message)
  );
});

const app    = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Opportunity Hub API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: '2.0.0',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/public',        publicRoutes);       // Public — no auth required
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/freelancing", freelancingRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/scholarships", scholarshipRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀  Opportunity Hub Server`);
  console.log(`📡  Port    : ${PORT}`);
  console.log(`🌍  Mode    : ${process.env.NODE_ENV}`);
  console.log(`🏥  Health  : http://localhost:${PORT}/api/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

module.exports = { app, io };
