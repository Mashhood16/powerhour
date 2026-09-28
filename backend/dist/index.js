"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const auth_1 = __importDefault(require("./routes/auth"));
const tutor_1 = __importDefault(require("./routes/tutor"));
const socket_1 = require("./realtime/socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/tutors', tutor_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'PowerHour API is running' });
});
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.io Real-time Infrastructure
(0, socket_1.initializeRealtime)(server);
server.listen(PORT, () => {
    console.log(`[Server] Listening on port ${PORT}`);
});
