"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const rateLimiter_1 = require("./middleware/rateLimiter");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}));
app.use((0, cors_1.default)({ origin: process.env.ALLOWED_ORIGINS?.split(",") || false, credentials: false, methods: ["POST", "GET", "DELETE", "PUT"], allowedHeaders: ["Content-Type"], }));
app.use(express_1.default.json({
    limit: "1mb",
    strict: true,
}));
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use("/api/auth", rateLimiter_1.authRateLimit);
app.use("/api/auth", authRoutes_1.default);
app.get("/health", (_req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
    });
});
app.use((_err, _req, res, _next) => {
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
});
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Not Found",
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
});
exports.default = app;
