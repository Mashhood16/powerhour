"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// We use the Pool for standard queries to handle multiple concurrent connections.
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
exports.pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
/**
 * Standard query helper.
 */
const query = (text, params) => {
    return exports.pool.query(text, params);
};
exports.query = query;
/**
 * Helper to execute a set of operations within a SQL Transaction.
 */
const getClient = async () => {
    const client = await exports.pool.connect();
    return client;
};
exports.getClient = getClient;
