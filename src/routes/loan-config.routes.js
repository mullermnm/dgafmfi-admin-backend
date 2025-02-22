const express = require('express');
const router = express.Router();
const {
  createLoanConfig,
  getAllLoanConfigs,
  getLoanConfigById,
  updateLoanConfig,
  deleteLoanConfig,
  getPayDayMonths,
  getServiceCharges,
  getKihlotMaxAmount,
  getKihlotInterestRate
} = require('../controllers/loan-config.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Admin routes for CRUD operations
router.route('/')
  .get(protect, authorize('admin'), getAllLoanConfigs)
  .post(protect, authorize('admin'), createLoanConfig);

router.route('/:id')
  .get(protect, authorize('admin'), getLoanConfigById)
  .put(protect, authorize('admin'), updateLoanConfig)
  .delete(protect, authorize('admin'), deleteLoanConfig);

// Public calculator API routes
router.get('/calculator/payday-months', getPayDayMonths);
router.get('/calculator/service-charges', getServiceCharges);
router.get('/calculator/kihlot-maximum-loan-amount', getKihlotMaxAmount);
router.get('/calculator/kihloan-interest-rate', getKihlotInterestRate);

module.exports = router;
