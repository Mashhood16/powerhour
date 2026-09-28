"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
// Mock Database for Wallets and Transactions
const walletsDB = [];
const transactionsDB = [];
/**
 * Immutable Ledger Service handling financial operations in PKR.
 * In a real environment, all these methods MUST be wrapped in SQL Transactions.
 */
class WalletService {
    static getWallet(userId) {
        let wallet = walletsDB.find(w => w.userId === userId);
        if (!wallet) {
            // Auto-create for simulation
            wallet = { id: `wallet-${Date.now()}`, userId, balance: 10000, heldBalance: 0 };
            walletsDB.push(wallet);
        }
        return wallet;
    }
    /**
     * Hold funds in the student's wallet when a booking is requested.
     */
    static holdFunds(userId, amount, bookingId) {
        const wallet = this.getWallet(userId);
        if (wallet.balance < amount) {
            throw new Error('Insufficient funds');
        }
        wallet.balance -= amount;
        wallet.heldBalance += amount;
        const tx = {
            id: `tx-hold-${Date.now()}`,
            walletId: wallet.id,
            bookingId,
            type: 'HOLD',
            amount,
            createdAt: new Date(),
        };
        transactionsDB.push(tx);
        return tx;
    }
    /**
     * Release held funds back to available balance (e.g., if booking is declined).
     */
    static releaseFunds(userId, amount, bookingId, holdTxId) {
        const wallet = this.getWallet(userId);
        if (wallet.heldBalance < amount) {
            throw new Error('Insufficient held funds to release');
        }
        wallet.heldBalance -= amount;
        wallet.balance += amount;
        const tx = {
            id: `tx-release-${Date.now()}`,
            walletId: wallet.id,
            bookingId,
            type: 'RELEASE',
            amount,
            referenceId: holdTxId,
            createdAt: new Date(),
        };
        transactionsDB.push(tx);
        return tx;
    }
    /**
     * Transfer held funds to the teacher and deduct platform commission.
     */
    static transferToTeacher(studentId, teacherId, amount, bookingId, holdTxId) {
        const studentWallet = this.getWallet(studentId);
        const teacherWallet = this.getWallet(teacherId);
        if (studentWallet.heldBalance < amount) {
            throw new Error('Insufficient held funds to transfer');
        }
        // 1. Deduct held balance from student
        studentWallet.heldBalance -= amount;
        const transferOutTx = {
            id: `tx-transfer-out-${Date.now()}`,
            walletId: studentWallet.id,
            bookingId,
            type: 'TRANSFER',
            amount,
            referenceId: holdTxId,
            createdAt: new Date(),
        };
        // 2. Add full amount to teacher balance
        teacherWallet.balance += amount;
        const transferInTx = {
            id: `tx-transfer-in-${Date.now()}`,
            walletId: teacherWallet.id,
            bookingId,
            type: 'TRANSFER',
            amount,
            referenceId: transferOutTx.id,
            createdAt: new Date(),
        };
        // 3. Deduct 10% platform commission from teacher
        const commission = amount * 0.10;
        teacherWallet.balance -= commission;
        const commTx = {
            id: `tx-comm-${Date.now()}`,
            walletId: teacherWallet.id,
            bookingId,
            type: 'COMMISSION',
            amount: commission,
            referenceId: transferInTx.id,
            createdAt: new Date(),
        };
        transactionsDB.push(transferOutTx, transferInTx, commTx);
        return { transferTx: transferInTx, commTx };
    }
}
exports.WalletService = WalletService;
