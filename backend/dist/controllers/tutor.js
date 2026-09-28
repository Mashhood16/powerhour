"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTutors = void 0;
const db_1 = require("../db");
const searchTutors = async (req, res) => {
    try {
        const { subject, maxPrice, minRating } = req.query;
        let sql = `
      SELECT 
        u.id as user_id, 
        tp.first_name, 
        tp.last_name, 
        tp.subjects, 
        tp.base_hourly_rate, 
        tp.average_rating,
        tp.total_lectures
      FROM users u
      JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE u.status = 'ACTIVE' 
        AND tp.approval_status = 'APPROVED'
    `;
        const params = [];
        let paramIndex = 1;
        // Filter by subject
        if (subject) {
            sql += ` AND $${paramIndex} = ANY(tp.subjects)`;
            params.push(subject);
            paramIndex++;
        }
        // Filter by maximum hourly rate
        if (maxPrice) {
            sql += ` AND tp.base_hourly_rate <= $${paramIndex}`;
            params.push(parseFloat(maxPrice));
            paramIndex++;
        }
        // Filter by minimum rating
        if (minRating) {
            sql += ` AND tp.average_rating >= $${paramIndex}`;
            params.push(parseFloat(minRating));
            paramIndex++;
        }
        // Order by highest rating and most lectures
        sql += ` ORDER BY tp.average_rating DESC, tp.total_lectures DESC LIMIT 50`;
        const result = await (0, db_1.query)(sql, params);
        res.status(200).json({ tutors: result.rows });
    }
    catch (error) {
        console.error('Search Tutors Error:', error);
        res.status(500).json({ message: 'Internal server error during tutor search' });
    }
};
exports.searchTutors = searchTutors;
