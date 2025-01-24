const { StatusCodes } = require('http-status-codes');
const BaseController = require('./base.controller');
const Stats = require('../models/stats.model');

class StatsController extends BaseController {
  constructor() {
    super();
    this.getStats = this.getStats.bind(this);
    this.updateStats = this.updateStats.bind(this);
  }

  async getStats(req, res) {
    try {
      console.log('Fetching stats...');
      await this.checkAuthorization(req);
      
      let stats = await Stats.findOne();
      if (!stats) {
        stats = await Stats.create({
          moneyAmount: 0,
          productCount: 0,
          updatedBy: req.user._id
        });
      }
      
      console.log('Stats fetched successfully:', stats);
      return this.handleSuccess(res, stats);
    } catch (error) {
      console.error('Error in getStats:', error);
      return this.handleError(res, error);
    }
  }

  async updateStats(req, res) {
    try {
      console.log('Updating stats...');
      await this.checkAuthorization(req);
      
      const { moneyAmount, productCount } = req.body;
      
      // Validate input
      if (moneyAmount === undefined || productCount === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Both money amount and product count are required'
        });
      }

      if (moneyAmount < 0 || productCount < 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Values cannot be negative'
        });
      }

      let stats = await Stats.findOne();
      if (!stats) {
        stats = await Stats.create({
          moneyAmount,
          productCount,
          updatedBy: req.user._id
        });
      } else {
        stats.moneyAmount = moneyAmount;
        stats.productCount = productCount;
        stats.updatedBy = req.user._id;
        stats.lastUpdated = Date.now();
        await stats.save();
      }

      console.log('Stats updated successfully:', stats);
      return this.handleSuccess(res, stats, 'Stats updated successfully');
    } catch (error) {
      console.error('Error in updateStats:', error);
      return this.handleError(res, error);
    }
  }
}

module.exports = StatsController;
