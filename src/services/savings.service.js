const { FuelEntry, Vehicle } = require('../models');
const { calculateFuelEfficiency, calculatePotentialSavings } = require('../helpers/fuelCalculator.helper');

class SavingsService {
  static async getFuelSavingTips(userId) {
    try {
      const userVehicles = await Vehicle.find({ user: userId });
      const tips = [];

      for (const vehicle of userVehicles) {
        const fuelEntries = await FuelEntry.find({
          user: userId,
          vehicle: vehicle._id
        }).sort({ date: -1 }).limit(10);

        if (fuelEntries.length < 3) continue;

        // Calculate average efficiency
        const totalFuel = fuelEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0);
        const totalDistance = fuelEntries.reduce((sum, entry) => sum + entry.distance, 0);
        const averageEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

        // Get current fuel price (assuming it's stored somewhere or use default)
        const currentPrice = 100; // This should come from a fuel price service

        // Generate personalized tips based on vehicle data
        const vehicleTips = this.generateVehicleTips(vehicle, fuelEntries, averageEfficiency, currentPrice);
        tips.push(...vehicleTips);
      }

      // Add general tips
      tips.push(...this.getGeneralTips());

      return tips.sort((a, b) => b.savings - a.savings);
    } catch (error) {
      throw new Error(`Failed to get fuel saving tips: ${error.message}`);
    }
  }

  static generateVehicleTips(vehicle, fuelEntries, averageEfficiency, fuelPrice) {
    const tips = [];
    const monthlyFuelConsumption = this.calculateMonthlyConsumption(fuelEntries);

    // Tip 1: Maintain proper tire pressure
    const tirePressureSavings = calculatePotentialSavings(monthlyFuelConsumption, 0.03, fuelPrice);
    tips.push({
      id: `tire_pressure_${vehicle._id}`,
      title: 'Maintain Proper Tire Pressure',
      description: 'Keep your tires inflated to the recommended pressure. Under-inflated tires can reduce fuel efficiency by up to 3%.',
      category: 'maintenance',
      vehicle: vehicle.name,
      savings: tirePressureSavings,
      difficulty: 'easy',
      impact: 'high'
    });

    // Tip 2: Regular engine maintenance
    const maintenanceSavings = calculatePotentialSavings(monthlyFuelConsumption, 0.04, fuelPrice);
    tips.push({
      id: `engine_maintenance_${vehicle._id}`,
      title: 'Regular Engine Maintenance',
      description: 'Get regular oil changes and tune-ups. A well-maintained engine can improve fuel efficiency by up to 4%.',
      category: 'maintenance',
      vehicle: vehicle.name,
      savings: maintenanceSavings,
      difficulty: 'medium',
      impact: 'high'
    });

    // Tip 3: Smooth driving
    const drivingSavings = calculatePotentialSavings(monthlyFuelConsumption, 0.10, fuelPrice);
    tips.push({
      id: `smooth_driving_${vehicle._id}`,
      title: 'Practice Smooth Driving',
      description: 'Avoid sudden acceleration and braking. Smooth driving can improve fuel efficiency by up to 10%.',
      category: 'driving',
      vehicle: vehicle.name,
      savings: drivingSavings,
      difficulty: 'medium',
      impact: 'high'
    });

    // Tip 4: Remove excess weight
    const weightSavings = calculatePotentialSavings(monthlyFuelConsumption, 0.02, fuelPrice);
    tips.push({
      id: `reduce_weight_${vehicle._id}`,
      title: 'Remove Excess Weight',
      description: 'Remove unnecessary items from your vehicle. Extra weight can reduce fuel efficiency by 1-2% per 45kg.',
      category: 'vehicle',
      vehicle: vehicle.name,
      savings: weightSavings,
      difficulty: 'easy',
      impact: 'medium'
    });

    // Tip 5: Use air conditioning wisely
    const acSavings = calculatePotentialSavings(monthlyFuelConsumption, 0.08, fuelPrice);
    tips.push({
      id: `ac_usage_${vehicle._id}`,
      title: 'Use AC Wisely',
      description: 'Turn off AC when not needed and use recirculate mode. AC can reduce fuel efficiency by up to 8%.',
      category: 'driving',
      vehicle: vehicle.name,
      savings: acSavings,
      difficulty: 'easy',
      impact: 'high'
    });

    // Tip 6: Maintain optimal speed
    const speedSavings = calculatePotentialSavings(monthlyFuelConsumption, 0.15, fuelPrice);
    tips.push({
      id: `optimal_speed_${vehicle._id}`,
      title: 'Maintain Optimal Speed',
      description: 'Drive at optimal speeds (typically 60-80 km/h on highways). Higher speeds significantly reduce fuel efficiency.',
      category: 'driving',
      vehicle: vehicle.name,
      savings: speedSavings,
      difficulty: 'medium',
      impact: 'high'
    });

    return tips;
  }

  static getGeneralTips() {
    return [
      {
        id: 'carpool_general',
        title: 'Carpool When Possible',
        description: 'Share rides with others going to the same destination. This can reduce your fuel costs significantly.',
        category: 'lifestyle',
        vehicle: 'All Vehicles',
        savings: 500, // Monthly estimate
        difficulty: 'medium',
        impact: 'high'
      },
      {
        id: 'public_transport_general',
        title: 'Consider Public Transport',
        description: 'For short trips, consider walking, cycling, or using public transport instead of driving.',
        category: 'lifestyle',
        vehicle: 'All Vehicles',
        savings: 300, // Monthly estimate
        difficulty: 'medium',
        impact: 'high'
      },
      {
        id: 'fuel_efficient_vehicle_general',
        title: 'Consider Fuel-Efficient Vehicles',
        description: 'When buying a new vehicle, consider fuel-efficient or electric options for long-term savings.',
        category: 'purchase',
        vehicle: 'All Vehicles',
        savings: 1000, // Monthly estimate
        difficulty: 'hard',
        impact: 'high'
      }
    ];
  }

  static calculateMonthlyConsumption(fuelEntries) {
    if (fuelEntries.length === 0) return 0;

    const totalFuel = fuelEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0);
    const firstEntry = fuelEntries[fuelEntries.length - 1];
    const lastEntry = fuelEntries[0];
    const daysDiff = Math.max(1, (lastEntry.date - firstEntry.date) / (1000 * 60 * 60 * 24));

    return (totalFuel / daysDiff) * 30; // Monthly consumption
  }

  static async calculatePotentialSavings(userId) {
    try {
      const tips = await this.getFuelSavingTips(userId);
      const totalMonthlySavings = tips.reduce((sum, tip) => sum + tip.savings, 0);
      const totalAnnualSavings = totalMonthlySavings * 12;

      // Get current fuel consumption
      const fuelEntries = await FuelEntry.find({ user: userId }).sort({ date: -1 }).limit(30);
      const monthlyFuelConsumption = this.calculateMonthlyConsumption(fuelEntries);
      const currentFuelPrice = 100; // Should come from fuel price service
      const monthlyFuelCost = monthlyFuelConsumption * currentFuelPrice;

      return {
        currentMonthlyFuelCost: monthlyFuelCost,
        potentialMonthlySavings: totalMonthlySavings,
        potentialAnnualSavings: totalAnnualSavings,
        savingsPercentage: monthlyFuelCost > 0 ? (totalMonthlySavings / monthlyFuelCost) * 100 : 0,
        tips: tips.slice(0, 10) // Top 10 tips
      };
    } catch (error) {
      throw new Error(`Failed to calculate potential savings: ${error.message}`);
    }
  }

  static async getSavingsReport(userId, user) {
    try {
      const savingsData = await this.calculatePotentialSavings(userId);
      const tips = await this.getFuelSavingTips(userId);

      const reportData = {
        monthlySavings: savingsData.potentialMonthlySavings,
        annualSavings: savingsData.potentialAnnualSavings,
        currentFuelCost: savingsData.currentMonthlyFuelCost,
        savingsPercentage: savingsData.savingsPercentage,
        tips: tips.map(tip => ({
          title: tip.title,
          description: tip.description,
          savings: tip.savings,
          category: tip.category,
          difficulty: tip.difficulty,
          impact: tip.impact
        }))
      };

      return reportData;
    } catch (error) {
      throw new Error(`Failed to generate savings report: ${error.message}`);
    }
  }

  static async trackSavingsGoals(userId) {
    try {
      // This would typically store user-defined savings goals
      // For now, return default goals based on their current usage
      const savingsData = await this.calculatePotentialSavings(userId);

      const goals = [
        {
          id: 'reduce_monthly_cost',
          title: 'Reduce Monthly Fuel Cost',
          description: 'Save ₹500 per month on fuel expenses',
          targetAmount: 500,
          currentProgress: Math.min(savingsData.potentialMonthlySavings, 500),
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          status: savingsData.potentialMonthlySavings >= 500 ? 'achieved' : 'in_progress'
        },
        {
          id: 'improve_efficiency',
          title: 'Improve Fuel Efficiency',
          description: 'Increase fuel efficiency by 10%',
          targetAmount: 10, // percentage
          currentProgress: savingsData.savingsPercentage,
          deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
          status: savingsData.savingsPercentage >= 10 ? 'achieved' : 'in_progress'
        }
      ];

      return goals;
    } catch (error) {
      throw new Error(`Failed to track savings goals: ${error.message}`);
    }
  }
}

module.exports = SavingsService;
