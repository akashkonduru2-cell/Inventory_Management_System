const Transaction = require('../models/Transaction');

class TransactionService {
  static async getAllTransactions(filters, user) {
    // If user is EMPLOYEE, restrict to their own transactions if requested, or filter by user_id
    const effectiveFilters = { ...filters };
    if (user && user.role === 'EMPLOYEE') {
      // Employees can view transactions; if requested, restrict or show their user transactions
    }
    return Transaction.findAll(effectiveFilters);
  }

  static async getTransactionById(id) {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    return transaction;
  }
}

module.exports = TransactionService;
