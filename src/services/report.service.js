const { FuelEntry, Vehicle, MonthlyReport } = require('../models');
const PDFHelper = require('../helpers/pdf.helper');
const FuelService = require('./fuel.service');

class ReportService {
  static async generateFuelReport(userId, filters = {}) {
    try {
      const fuelEntries = await FuelService.getFuelEntries(userId, filters);
      const statistics = await FuelService.getFuelStatistics(userId, filters);

      const reportData = {
        totalEntries: statistics.totalEntries,
        totalFuel: statistics.totalFuel,
        totalDistance: statistics.totalDistance,
        averageEfficiency: statistics.averageEfficiency,
        totalCost: statistics.totalCost,
        entries: fuelEntries.map(entry => ({
          date: entry.date,
          vehicle: entry.vehicle,
          fuelAmount: entry.fuelAmount,
          distance: entry.distance,
          efficiency: entry.efficiency,
          cost: entry.cost,
          notes: entry.notes
        }))
      };

      return reportData;
    } catch (error) {
      throw new Error(`Failed to generate fuel report: ${error.message}`);
    }
  }

  static async generateMonthlyReport(userId, month, year) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const filters = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      const fuelEntries = await FuelService.getFuelEntries(userId, filters);
      const statistics = await FuelService.getFuelStatistics(userId, filters);

      // Get vehicle-wise breakdown
      const vehicleStats = {};
      fuelEntries.forEach(entry => {
        const vehicleId = entry.vehicle._id.toString();
        if (!vehicleStats[vehicleId]) {
          vehicleStats[vehicleId] = {
            vehicle: entry.vehicle,
            entries: [],
            totalFuel: 0,
            totalDistance: 0,
            totalCost: 0
          };
        }

        vehicleStats[vehicleId].entries.push(entry);
        vehicleStats[vehicleId].totalFuel += entry.fuelAmount;
        vehicleStats[vehicleId].totalDistance += entry.distance;
        vehicleStats[vehicleId].totalCost += entry.cost;
      });

      // Calculate efficiency for each vehicle
      Object.keys(vehicleStats).forEach(vehicleId => {
        const stats = vehicleStats[vehicleId];
        stats.averageEfficiency = stats.totalFuel > 0 ? stats.totalDistance / stats.totalFuel : 0;
      });

      const monthlyReport = {
        user: userId,
        month,
        year,
        period: `${year}-${month.toString().padStart(2, '0')}`,
        summary: {
          totalEntries: statistics.totalEntries,
          totalFuel: statistics.totalFuel,
          totalDistance: statistics.totalDistance,
          totalCost: statistics.totalCost,
          averageEfficiency: statistics.averageEfficiency
        },
        vehicleBreakdown: Object.values(vehicleStats),
        generatedAt: new Date()
      };

      // Save to database
      const savedReport = new MonthlyReport(monthlyReport);
      await savedReport.save();

      return savedReport;
    } catch (error) {
      throw new Error(`Failed to generate monthly report: ${error.message}`);
    }
  }

  static async getMonthlyReports(userId, limit = 12) {
    try {
      const reports = await MonthlyReport.find({ user: userId })
        .sort({ year: -1, month: -1 })
        .limit(limit);

      return reports;
    } catch (error) {
      throw new Error(`Failed to get monthly reports: ${error.message}`);
    }
  }

  static async getMonthlyReportById(reportId, userId) {
    try {
      const report = await MonthlyReport.findOne({
        _id: reportId,
        user: userId
      });

      if (!report) {
        throw new Error('Monthly report not found');
      }

      return report;
    } catch (error) {
      throw new Error(`Failed to get monthly report: ${error.message}`);
    }
  }

  static async generatePDFReport(userId, filters = {}, user) {
    try {
      const reportData = await this.generateFuelReport(userId, filters);
      const pdfResult = await PDFHelper.generateFuelReport(reportData, user);

      return pdfResult;
    } catch (error) {
      throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
  }

  static async getFuelAnalytics(userId, timeframe = 'month') {
    try {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const fuelEntries = await FuelEntry.find({
        user: userId,
        date: { $gte: startDate }
      }).populate('vehicle', 'name type');

      const analytics = {
        timeframe,
        startDate,
        endDate: now,
        totalEntries: fuelEntries.length,
        totalFuel: fuelEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0),
        totalCost: fuelEntries.reduce((sum, entry) => sum + entry.cost, 0),
        averageCostPerLiter: 0,
        vehicleAnalytics: {},
        dailyConsumption: {},
        efficiencyTrend: []
      };

      if (analytics.totalFuel > 0) {
        analytics.averageCostPerLiter = analytics.totalCost / analytics.totalFuel;
      }

      // Vehicle-wise analytics
      fuelEntries.forEach(entry => {
        const vehicleId = entry.vehicle._id.toString();
        if (!analytics.vehicleAnalytics[vehicleId]) {
          analytics.vehicleAnalytics[vehicleId] = {
            vehicle: entry.vehicle,
            entries: 0,
            totalFuel: 0,
            totalCost: 0,
            totalDistance: 0
          };
        }

        const vehicle = analytics.vehicleAnalytics[vehicleId];
        vehicle.entries += 1;
        vehicle.totalFuel += entry.fuelAmount;
        vehicle.totalCost += entry.cost;
        vehicle.totalDistance += entry.distance;
      });

      // Calculate efficiency for each vehicle
      Object.keys(analytics.vehicleAnalytics).forEach(vehicleId => {
        const vehicle = analytics.vehicleAnalytics[vehicleId];
        vehicle.averageEfficiency = vehicle.totalFuel > 0 ? vehicle.totalDistance / vehicle.totalFuel : 0;
      });

      // Daily consumption
      fuelEntries.forEach(entry => {
        const dateKey = entry.date.toISOString().split('T')[0];
        if (!analytics.dailyConsumption[dateKey]) {
          analytics.dailyConsumption[dateKey] = {
            date: dateKey,
            fuel: 0,
            cost: 0,
            entries: 0
          };
        }

        analytics.dailyConsumption[dateKey].fuel += entry.fuelAmount;
        analytics.dailyConsumption[dateKey].cost += entry.cost;
        analytics.dailyConsumption[dateKey].entries += 1;
      });

      // Efficiency trend (last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentEntries = fuelEntries.filter(entry => entry.date >= thirtyDaysAgo);

      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        const dayEntries = recentEntries.filter(entry =>
          entry.date.toISOString().split('T')[0] === dateKey
        );

        const totalFuel = dayEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0);
        const totalDistance = dayEntries.reduce((sum, entry) => sum + entry.distance, 0);
        const efficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

        analytics.efficiencyTrend.push({
          date: dateKey,
          efficiency: efficiency,
          fuelConsumed: totalFuel
        });
      }

      return analytics;
    } catch (error) {
      throw new Error(`Failed to get fuel analytics: ${error.message}`);
    }
  }
}

module.exports = ReportService;
