import { WalletService } from './wallet.service';

export type BookingState = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface Booking {
  id: string;
  studentId: string;
  teacherId: string;
  status: BookingState;
  lessonFee: number;
  holdTxId?: string; 
}

const bookingsDB: Booking[] = [];

/**
 * Strict State Machine for Bookings.
 * Enforces valid state transitions and triggers financial ledger events.
 */
export class BookingService {

  /**
   * Request a booking. Triggers a financial HOLD.
   * Transition: (None) -> PENDING
   */
  static requestBooking(studentId: string, teacherId: string, lessonFee: number): Booking {
    const bookingId = `booking-${Date.now()}`;
    
    // Hold funds from student's wallet
    const holdTx = WalletService.holdFunds(studentId, lessonFee, bookingId);

    const newBooking: Booking = {
      id: bookingId,
      studentId,
      teacherId,
      status: 'PENDING',
      lessonFee,
      holdTxId: holdTx.id
    };

    bookingsDB.push(newBooking);
    return newBooking;
  }

  /**
   * Teacher accepts the booking.
   * Transition: PENDING -> CONFIRMED
   */
  static confirmBooking(bookingId: string): Booking {
    const booking = this.getBooking(bookingId);
    this.enforceValidTransition(booking.status, 'CONFIRMED', ['PENDING']);
    booking.status = 'CONFIRMED';
    return booking;
  }

  /**
   * Booking cancelled by either party or declined by teacher. Triggers financial RELEASE.
   * Transition: PENDING / CONFIRMED -> CANCELLED
   */
  static cancelBooking(bookingId: string): Booking {
    const booking = this.getBooking(bookingId);
    this.enforceValidTransition(booking.status, 'CANCELLED', ['PENDING', 'CONFIRMED']);
    
    // Release held funds back to student
    if (booking.holdTxId) {
      WalletService.releaseFunds(booking.studentId, booking.lessonFee, booking.id, booking.holdTxId);
    }

    booking.status = 'CANCELLED';
    return booking;
  }

  /**
   * Lesson begins.
   * Transition: CONFIRMED -> IN_PROGRESS
   */
  static startLesson(bookingId: string): Booking {
    const booking = this.getBooking(bookingId);
    this.enforceValidTransition(booking.status, 'IN_PROGRESS', ['CONFIRMED']);
    booking.status = 'IN_PROGRESS';
    return booking;
  }

  /**
   * Lesson ends successfully. Triggers financial TRANSFER and COMMISSION.
   * Transition: IN_PROGRESS -> COMPLETED
   */
  static completeLesson(bookingId: string): Booking {
    const booking = this.getBooking(bookingId);
    this.enforceValidTransition(booking.status, 'COMPLETED', ['IN_PROGRESS']);
    
    if (booking.holdTxId) {
      WalletService.transferToTeacher(
        booking.studentId, 
        booking.teacherId, 
        booking.lessonFee, 
        booking.id, 
        booking.holdTxId
      );
    }

    booking.status = 'COMPLETED';
    return booking;
  }

  /**
   * Issue raised by student or teacher. Funds remain held.
   * Transition: IN_PROGRESS / COMPLETED -> DISPUTED
   */
  static raiseDispute(bookingId: string): Booking {
    const booking = this.getBooking(bookingId);
    this.enforceValidTransition(booking.status, 'DISPUTED', ['IN_PROGRESS', 'COMPLETED']);
    booking.status = 'DISPUTED';
    return booking;
  }

  // --- Helpers ---

  private static getBooking(bookingId: string): Booking {
    const booking = bookingsDB.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    return booking;
  }

  private static enforceValidTransition(currentState: BookingState, targetState: BookingState, allowedPreviousStates: BookingState[]) {
    if (!allowedPreviousStates.includes(currentState)) {
      throw new Error(`Invalid state transition from ${currentState} to ${targetState}`);
    }
  }
}
