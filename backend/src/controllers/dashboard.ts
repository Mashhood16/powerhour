import { Request, Response } from 'express';
import { query } from '../db';

export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const { userId, role } = req.user;

  try {
    // 1. Fetch Wallet
    const walletRes = await query('SELECT balance, held_balance FROM wallets WHERE user_id = $1', [userId]);
    const wallet = walletRes.rows[0];

    // 2. Fetch Profile
    let profile = null;
    if (role === 'STUDENT') {
      const pRes = await query('SELECT first_name, last_name FROM student_profiles WHERE user_id = $1', [userId]);
      profile = pRes.rows[0];
    } else {
      const pRes = await query('SELECT first_name, last_name, approval_status FROM teacher_profiles WHERE user_id = $1', [userId]);
      profile = pRes.rows[0];
    }

    // 3. Fetch Bookings
    let bookings = [];
    if (role === 'STUDENT') {
      const bRes = await query(`
        SELECT b.id, b.status, b.lesson_fee, 
               tp.first_name as teacher_first_name, tp.last_name as teacher_last_name,
               a.start_time, a.end_time
        FROM bookings b
        JOIN teacher_profiles tp ON b.teacher_id = tp.user_id
        JOIN availabilities a ON b.availability_id = a.id
        WHERE b.student_id = $1
        ORDER BY a.start_time DESC
      `, [userId]);
      bookings = bRes.rows;
    } else {
      const bRes = await query(`
        SELECT b.id, b.status, b.lesson_fee, 
               sp.first_name as student_first_name, sp.last_name as student_last_name,
               a.start_time, a.end_time
        FROM bookings b
        JOIN student_profiles sp ON b.student_id = sp.user_id
        JOIN availabilities a ON b.availability_id = a.id
        WHERE b.teacher_id = $1
        ORDER BY a.start_time DESC
      `, [userId]);
      bookings = bRes.rows;
    }

    res.status(200).json({
      role,
      profile,
      wallet,
      bookings
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};
