"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const env_1 = require("./config/env");
const auth_1 = __importDefault(require("./routes/auth"));
const pdf_1 = __importDefault(require("./routes/pdf"));
const chat_1 = __importDefault(require("./routes/chat"));
const app = (0, express_1.default)();
if (!fs_1.default.existsSync(env_1.config.uploadPath)) {
    fs_1.default.mkdirSync(env_1.config.uploadPath, { recursive: true });
}
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express_1.default.static(env_1.config.uploadPath));
app.options('*', (0, cors_1.default)());
app.use('/api/auth', auth_1.default);
app.use('/api/pdfs', pdf_1.default);
app.use('/api/chat', chat_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: env_1.config.nodeEnv
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large' });
        }
        return res.status(400).json({ error: 'File upload error' });
    }
    return res.status(500).json({ error: 'Internal server error' });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
const PORT = env_1.config.port;
app.listen(PORT, () => {
    console.log(`🚀 ChatPDF Backend Server running on port ${PORT}`);
    console.log(`📁 Upload directory: ${env_1.config.uploadPath}`);
    console.log(`🌍 Environment: ${env_1.config.nodeEnv}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
//# sourceMappingURL=index.js.map