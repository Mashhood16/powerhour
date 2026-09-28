"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.verifyOtp = exports.register = void 0;
const security_1 = require("../utils/security");
const jwt_1 = require("../utils/jwt");
const db_1 = require("../db");
const register = async (req, res) => {
    const client = await (0, db_1.getClient)();
    try {
        const { email, password, phone, role, firstName, lastName, subjects, hourlyRate } = req.body;
        if (!email || !password || !role || !firstName || !lastName) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        await client.query('BEGIN'); // Start Transaction
        // 1. Check if user already exists
        const userCheck = await client.query('SELECT id FROM users WHERE email = $1 OR phone_number = $2', [email, phone || null]);
        if (userCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: 'Email or Phone already in use' });
        }
        const passwordHash = await (0, security_1.hashPassword)(password);
        // 2. Insert into users base table
        const userResult = await client.query(`INSERT INTO users (email, password_hash, phone_number, role, status) 
       VALUES ($1, $2, $3, $4, 'PENDING_OTP') RETURNING id`, [email, passwordHash, phone || null, role]);
        const userId = userResult.rows[0].id;
        // 3. Insert into specific profile table
        if (role === 'STUDENT') {
            await client.query(`INSERT INTO student_profiles (user_id, first_name, last_name) VALUES ($1, $2, $3)`, [userId, firstName, lastName]);
        }
        else if (role === 'TEACHER') {
            await client.query(`INSERT INTO teacher_profiles (user_id, first_name, last_name, subjects, base_hourly_rate) 
         VALUES ($1, $2, $3, $4, $5)`, [userId, firstName, lastName, subjects || '{}', hourlyRate || 1000]);
        }
        // 4. Create an empty wallet for the user
        await client.query(`INSERT INTO wallets (user_id, balance, held_balance) VALUES ($1, 0, 0)`, [userId]);
        await client.query('COMMIT'); // Commit Transaction
        // TODO: Send OTP via SMS/Email (Simulated)
        const mockOtp = '123456';
        console.log(`[OTP] Generated OTP for ${email}: ${mockOtp}`);
        res.status(201).json({
            message: 'Registration successful. Please verify OTP.',
            userId: userId
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Registration Error:', error.message);
        res.status(500).json({ message: 'Internal server error during registration' });
    }
    finally {
        client.release();
    }
};
exports.register = register;
const verifyOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({ message: 'userId and otp are required' });
        }
        // Mock validation
        if (otp !== '123456') {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        // Update status to ACTIVE
        const result = await (0, db_1.query)(`UPDATE users SET status = 'ACTIVE' WHERE id = $1 AND status = 'PENDING_OTP' RETURNING id`, [userId]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'User not found or already verified' });
        }
        res.status(200).json({ message: 'OTP verified successfully. Account is active.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.verifyOtp = verifyOtp;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await (0, db_1.query)(`SELECT id, email, password_hash, role, status FROM users WHERE email = $1`, [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const isMatch = await (0, security_1.verifyPassword)(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (user.status === 'PENDING_OTP') {
            return res.status(403).json({ message: 'Account not verified. Please verify OTP.' });
        }
        if (user.status === 'SUSPENDED') {
            return res.status(403).json({ message: 'Account is suspended. Contact support.' });
        }
        // Fetch profile data based on role
        let profile = null;
        if (user.role === 'STUDENT') {
            const studentRes = await (0, db_1.query)(`SELECT first_name, last_name FROM student_profiles WHERE user_id = $1`, [user.id]);
            profile = studentRes.rows[0];
        }
        else if (user.role === 'TEACHER') {
            const teacherRes = await (0, db_1.query)(`SELECT first_name, last_name, approval_status, average_rating FROM teacher_profiles WHERE user_id = $1`, [user.id]);
            profile = teacherRes.rows[0];
        }
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
