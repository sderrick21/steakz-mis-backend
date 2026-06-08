"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        res.sendStatus(401);
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.sendStatus(403);
            return;
        }
        if (!decoded) {
            res.sendStatus(401);
            return;
        }
        req.user = {
            id: decoded.userId,
            role: decoded.role
        };
        next();
    });
};
exports.authenticateToken = authenticateToken;
const authorizeRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!roles.includes(userRole)) {
            res.status(403).json({
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
//# sourceMappingURL=authMiddleware.js.map