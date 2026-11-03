const TransactionService = require('../services/transactionService');

const getTransactions = async (req, res, next) => {
  try {
    const { type, product_id, user_id, start_date, end_date } = req.query;
    const transactions = await TransactionService.getAllTransactions(
      {
        type,
        product_id: product_id ? parseInt(product_id, 10) : null,
        user_id: user_id ? parseInt(user_id, 10) : null,
        start_date,
        end_date
      },
      req.user
    );

    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await TransactionService.getTransactionById(req.params.id);
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById
};
