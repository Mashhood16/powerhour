"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const wallet_service_1 = require("./wallet.service");
const bookingsDB = [];
/**
 * Strict State Machine for Bookings.
 * Enforces valid state transitions and triggers financial ledger events.
 */
class BookingService {
    /**
     * Request a booking. Triggers a financial HOLD.
     * Transition: (None) -> PENDING
     */
    static requestBooking(studentId, teacherId, lessonFee) {
        const bookingId = `booking-${Date.now()}`;
        // Hold funds from student's wallet
        const holdTx = wallet_service_1.WalletService.holdFunds(studentId, lessonFee, bookingId);
        const newBooking = {
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
    static confirmBooking(bookingId) {
        const booking = this.getBooking(bookingId);
        this.enforceValidTransition(booking.status, 'CONFIRMED', ['PENDING']);
        booking.status = 'CONFIRMED';
        return booking;
    }
    /**
     * Booking cancelled by either party or declined by teacher. Triggers financial RELEASE.
     * Transition: PENDING / CONFIRMED -> CANCELLED
     */
    static cancelBooking(bookingId) {
        const booking = this.getBooking(bookingId);
        this.enforceValidTransition(booking.status, 'CANCELLED', ['PENDING', 'CONFIRMED']);
        // Release held funds back to student
        if (booking.holdTxId) {
            wallet_service_1.WalletService.releaseFunds(booking.studentId, booking.lessonFee, booking.id, booking.holdTxId);
        }
        booking.status = 'CANCELLED';
        return booking;
    }
    /**
     * Lesson begins.
     * Transition: CONFIRMED -> IN_PROGRESS
     */
    static startLesson(bookingId) {
        const booking = this.getBooking(bookingId);
        this.enforceValidTransition(booking.status, 'IN_PROGRESS', ['CONFIRMED']);
        booking.status = 'IN_PROGRESS';
        return booking;
    }
    /**
     * Lesson ends successfully. Triggers financial TRANSFER and COMMISSION.
     * Transition: IN_PROGRESS -> COMPLETED
     */
    static completeLesson(bookingId) {
        const booking = this.getBooking(bookingId);
        this.enforceValidTransition(booking.status, 'COMPLETED', ['IN_PROGRESS']);
        if (booking.holdTxId) {
            wallet_service_1.WalletService.transferToTeacher(booking.studentId, booking.teacherId, booking.lessonFee, booking.id, booking.holdTxId);
        }
        booking.status = 'COMPLETED';
        return booking;
    }
    /**
     * Issue raised by student or teacher. Funds remain held.
     * Transition: IN_PROGRESS / COMPLETED -> DISPUTED
     */
    static raiseDispute(bookingId) {
        const booking = this.getBooking(bookingId);
        this.enforceValidTransition(booking.status, 'DISPUTED', ['IN_PROGRESS', 'COMPLETED']);
        booking.status = 'DISPUTED';
        return booking;
    }
    // --- Helpers ---
    static getBooking(bookingId) {
        const booking = bookingsDB.find(b => b.id === bookingId);
        if (!booking)
            throw new Error('Booking not found');
        return booking;
    }
    static enforceValidTransition(currentState, targetState, allowedPreviousStates) {
        if (!allowedPreviousStates.includes(currentState)) {
            throw new Error(`Invalid state transition from ${currentState} to ${targetState}`);
        }
    }
}
exports.BookingService = BookingService;
