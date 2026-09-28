import { Request, Response } from 'express';
import { getClient, query } from '../db';
import { v4 as uuidv4 } from 'uuid';

export const requestBooking = async (req: Request, res: Response): Promise<void> => {
  const { teacherId, availabilityId, lessonFee } = req.body;
  
  // @ts-ignore - set by authMiddleware
  const studentId = req.user.userId;

  if (!teacherId || !availabilityId || !lessonFee) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // 1. Verify availability slot is valid and not already booked
    const slotRes = await client.query(
      'SELECT id, is_booked FROM availabilities WHERE id = $1 AND teacher_id = $2 FOR UPDATE',
      [availabilityId, teacherId]
    );

    if (slotRes.rows.length === 0) {
      throw new Error('Availability slot not found');
    }

    if (slotRes.rows[0].is_booked) {
      throw new Error('Slot is already booked');
    }

    // 2. Lock the student's wallet and check balance
    const walletRes = await client.query(
      'SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE',
      [studentId]
    );

    if (walletRes.rows.length === 0) {
      throw new Error('Wallet not found for student');
    }

    const wallet = walletRes.rows[0];
    const fee = parseFloat(lessonFee);

    if (parseFloat(wallet.balance) < fee) {
      throw new Error(`Insufficient funds. Your balance is ₨ ${wallet.balance}`);
    }

    // 3. Update the Wallet (Deduct balance, increase held_balance)
    await client.query(
      'UPDATE wallets SET balance = balance - $1, held_balance = held_balance + $1 WHERE id = $2',
      [fee, wallet.id]
    );

    // 4. Create the Booking record (PENDING)
    const bookingId = uuidv4();
    await client.query(
      `INSERT INTO bookings (id, student_id, teacher_id, availability_id, status, lesson_fee) 
       VALUES ($1, $2, $3, $4, 'PENDING', $5)`,
      [bookingId, studentId, teacherId, availabilityId, fee]
    );

    // 5. Mark the availability as booked
    await client.query(
      'UPDATE availabilities SET is_booked = TRUE WHERE id = $1',
      [availabilityId]
    );

    // 6. Record the HOLD transaction in the ledger
    await client.query(
      `INSERT INTO transactions (wallet_id, booking_id, type, amount, description) 
       VALUES ($1, $2, 'HOLD', $3, 'Funds held for pending booking')`,
      [wallet.id, bookingId, fee]
    );

    await client.query('COMMIT');

    res.status(201).json({ 
      message: 'Booking requested successfully. Funds are held.',
      bookingId 
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Booking transaction failed:', error.message);
    res.status(400).json({ message: error.message || 'Booking failed' });
  } finally {
    client.release();
  }
};
