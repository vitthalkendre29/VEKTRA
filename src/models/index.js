// Importing this file registers every Mongoose model exactly once, in an
// order where things referenced by $ref (User, Category, VektraAccount,
// VektraGoal) exist before anything that populates them. Route handlers
// import from here instead of individual model files.
import User from './ledger/User';
import Category from './ledger/Category';
import PaymentMethod from './ledger/PaymentMethod';
import Budget from './ledger/Budget';
import Expense from './ledger/Expense';
import RecurringExpense from './ledger/RecurringExpense';

import VektraProfile from './vektra/Profile';
import VektraAccount from './vektra/Account';
import VektraGoal from './vektra/Goal';
import VektraTransaction from './vektra/Transaction';
import VektraHolding from './vektra/Holding';
import VektraLoan from './vektra/Loan';
import VektraBill from './vektra/Bill';
import VektraNetWorthSnapshot from './vektra/NetWorthSnapshot';
import VektraAsset from './vektra/Asset';
import VektraLiability from './vektra/Liability';

export {
  User,
  Category,
  PaymentMethod,
  Budget,
  Expense,
  RecurringExpense,
  VektraProfile,
  VektraAccount,
  VektraGoal,
  VektraTransaction,
  VektraHolding,
  VektraLoan,
  VektraBill,
  VektraNetWorthSnapshot,
  VektraAsset,
  VektraLiability,
};
