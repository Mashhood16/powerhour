"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.hashPassword = void 0;
const argon2_1 = __importDefault(require("argon2"));
/**
 * Hash a password using Argon2 (adaptive hashing algorithm).
 */
const hashPassword = async (password) => {
    return await argon2_1.default.hash(password, {
        type: argon2_1.default.argon2id, // recommended variant
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3, // iterations
        parallelism: 1, // threads
    });
};
exports.hashPassword = hashPassword;
/**
 * Verify a password against a hash using Argon2.
 */
const verifyPassword = async (password, hash) => {
    try {
        return await argon2_1.default.verify(hash, password);
    }
    catch (err) {
        return false;
    }
};
exports.verifyPassword = verifyPassword;
