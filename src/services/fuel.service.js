const { FuelEntry } = require('../models');
const { calculateFuelEfficiency } = require('../helpers/fuelCalculator.helper');

class FuelService {
  static async createFuelEntry(userId, fuelData) {
    try {
      const fuelEntry = new FuelEntry({
        ...fuelData,
        user: userId,
        date: new Date(fuelData.date) || new Date()
      });

      // Calculate efficiency if distance and fuel amount are provided
      if (fuelData.distance && fuelData.fuelAmount) {
        fuelEntry.efficiency = calculateFuelEfficiency(fuelData.distance, fuelData.fuelAmount);
      }

      await fuelEntry.save();
      return fuelEntry;
    } catch (error) {
      throw new Error(`Failed to create fuel entry: ${error.message}`);
    }
  }

  static async getFuelEntries(userId, filters = {}) {
    try {
      const query = { user: userId };

      // Apply filters
      if (filters.vehicleId) {
        query.vehicle = filters.vehicleId;
      }

      if (filters.startDate && filters.endDate) {
        query.date = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const fuelEntries = await FuelEntry.find(query)
        .populate('vehicle', 'name type')
        .sort({ date: -1 });

      return fuelEntries;
    } catch (error) {
      throw new Error(`Failed to get fuel entries: ${error.message}`);
    }
  }

  static async getFuelEntryById(entryId, userId) {
    try {
      const fuelEntry = await FuelEntry.findOne({
        _id: entryId,
        user: userId
      }).populate('vehicle', 'name type');

      if (!fuelEntry) {
        throw new Error('Fuel entry not found');
      }

      return fuelEntry;
    } catch (error) {
      throw new Error(`Failed to get fuel entry: ${error.message}`);
    }
  }

  static async updateFuelEntry(entryId, userId, updateData) {
    try {
      const fuelEntry = await FuelEntry.findOneAndUpdate(
        { _id: entryId, user: userId },
        updateData,
        { new: true, runValidators: true }
      ).populate('vehicle', 'name type');

      if (!fuelEntry) {
        throw new Error('Fuel entry not found');
      }

      // Recalculate efficiency if distance or fuel amount changed
      if (updateData.distance || updateData.fuelAmount) {
        const distance = updateData.distance || fuelEntry.distance;
        const fuelAmount = updateData.fuelAmount || fuelEntry.fuelAmount;
        if (distance && fuelAmount) {
          fuelEntry.efficiency = calculateFuelEfficiency(distance, fuelAmount);
          await fuelEntry.save();
        }
      }

      return fuelEntry;
    } catch (error) {
      throw new Error(`Failed to update fuel entry: ${error.message}`);
    }
  }

  static async deleteFuelEntry(entryId, userId) {
    try {
      const fuelEntry = await FuelEntry.findOneAndDelete({
        _id: entryId,
        user: userId
      });

      if (!fuelEntry) {
        throw new Error('Fuel entry not found');
      }

      return { message: 'Fuel entry deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete fuel entry: ${error.message}`);
    }
  }

  static async getFuelStatistics(userId, filters = {}) {
    try {
      const query = { user: userId };

      if (filters.vehicleId) {
        query.vehicle = filters.vehicleId;
      }

      if (filters.startDate && filters.endDate) {
        query.date = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const fuelEntries = await FuelEntry.find(query);

      const stats = {
        totalEntries: fuelEntries.length,
        totalFuel: fuelEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0),
        totalDistance: fuelEntries.reduce((sum, entry) => sum + entry.distance, 0),
        totalCost: fuelEntries.reduce((sum, entry) => sum + entry.cost, 0),
        averageEfficiency: 0,
        averageCostPerLiter: 0
      };

      if (stats.totalFuel > 0) {
        stats.averageEfficiency = stats.totalDistance / stats.totalFuel;
        stats.averageCostPerLiter = stats.totalCost / stats.totalFuel;
      }

      return stats;
    } catch (error) {
      throw new Error(`Failed to get fuel statistics: ${error.message}`);
    }
  }

  static async getFuelTrends(userId, period = 'month') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
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
      }).sort({ date: 1 });

      const trends = {
        period,
        data: fuelEntries.map(entry => ({
          date: entry.date,
          fuelAmount: entry.fuelAmount,
          cost: entry.cost,
          efficiency: entry.efficiency
        }))
      };

      return trends;
    } catch (error) {
      throw new Error(`Failed to get fuel trends: ${error.message}`);
    }
  }
}

module.exports = FuelService;
