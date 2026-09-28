export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  heldBalance: number;
}

export interface Transaction {
  id: string;
  walletId: string;
  bookingId?: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'HOLD' | 'RELEASE' | 'TRANSFER' | 'COMMISSION';
  amount: number;
  referenceId?: string;
  createdAt: Date;
}

// Mock Database for Wallets and Transactions
const walletsDB: Wallet[] = [];
const transactionsDB: Transaction[] = [];

/**
 * Immutable Ledger Service handling financial operations in PKR.
 * In a real environment, all these methods MUST be wrapped in SQL Transactions.
 */
export class WalletService {
  
  static getWallet(userId: string): Wallet {
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
  static holdFunds(userId: string, amount: number, bookingId: string): Transaction {
    const wallet = this.getWallet(userId);

    if (wallet.balance < amount) {
      throw new Error('Insufficient funds');
    }

    wallet.balance -= amount;
    wallet.heldBalance += amount;

    const tx: Transaction = {
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
  static releaseFunds(userId: string, amount: number, bookingId: string, holdTxId: string): Transaction {
    const wallet = this.getWallet(userId);

    if (wallet.heldBalance < amount) {
      throw new Error('Insufficient held funds to release');
    }

    wallet.heldBalance -= amount;
    wallet.balance += amount;

    const tx: Transaction = {
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
  static transferToTeacher(
    studentId: string, 
    teacherId: string, 
    amount: number, 
    bookingId: string, 
    holdTxId: string
  ): { transferTx: Transaction, commTx: Transaction } {
    const studentWallet = this.getWallet(studentId);
    const teacherWallet = this.getWallet(teacherId);

    if (studentWallet.heldBalance < amount) {
      throw new Error('Insufficient held funds to transfer');
    }

    // 1. Deduct held balance from student
    studentWallet.heldBalance -= amount;
    const transferOutTx: Transaction = {
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
    const transferInTx: Transaction = {
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
    const commTx: Transaction = {
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
