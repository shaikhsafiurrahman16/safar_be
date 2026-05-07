// Fuel calculation helper functions

/**
 * Calculate fuel efficiency (km/l)
 * @param {number} distance - Distance traveled in km
 * @param {number} fuelAmount - Fuel consumed in liters
 * @returns {number} Fuel efficiency in km/l
 */
function calculateFuelEfficiency(distance, fuelAmount) {
  if (!distance || !fuelAmount || fuelAmount <= 0) {
    return 0;
  }
  return distance / fuelAmount;
}

/**
 * Calculate fuel consumption (l/100km)
 * @param {number} distance - Distance traveled in km
 * @param {number} fuelAmount - Fuel consumed in liters
 * @returns {number} Fuel consumption in l/100km
 */
function calculateFuelConsumption(distance, fuelAmount) {
  if (!distance || !fuelAmount || distance <= 0) {
    return 0;
  }
  return (fuelAmount / distance) * 100;
}

/**
 * Calculate cost per km
 * @param {number} totalCost - Total fuel cost
 * @param {number} distance - Distance traveled in km
 * @returns {number} Cost per km
 */
function calculateCostPerKm(totalCost, distance) {
  if (!totalCost || !distance || distance <= 0) {
    return 0;
  }
  return totalCost / distance;
}

/**
 * Calculate cost per liter
 * @param {number} totalCost - Total fuel cost
 * @param {number} fuelAmount - Fuel consumed in liters
 * @returns {number} Cost per liter
 */
function calculateCostPerLiter(totalCost, fuelAmount) {
  if (!totalCost || !fuelAmount || fuelAmount <= 0) {
    return 0;
  }
  return totalCost / fuelAmount;
}

/**
 * Calculate potential savings based on efficiency improvement
 * @param {number} monthlyFuelConsumption - Monthly fuel consumption in liters
 * @param {number} efficiencyImprovement - Efficiency improvement percentage (0.05 = 5%)
 * @param {number} fuelPricePerLiter - Current fuel price per liter
 * @returns {number} Potential monthly savings in currency
 */
function calculatePotentialSavings(monthlyFuelConsumption, efficiencyImprovement, fuelPricePerLiter) {
  if (!monthlyFuelConsumption || !efficiencyImprovement || !fuelPricePerLiter) {
    return 0;
  }

  const fuelSaved = monthlyFuelConsumption * efficiencyImprovement;
  return fuelSaved * fuelPricePerLiter;
}

/**
 * Calculate average fuel efficiency from multiple entries
 * @param {Array} fuelEntries - Array of fuel entry objects with distance and fuelAmount
 * @returns {number} Average fuel efficiency in km/l
 */
function calculateAverageEfficiency(fuelEntries) {
  if (!fuelEntries || fuelEntries.length === 0) {
    return 0;
  }

  const validEntries = fuelEntries.filter(entry =>
    entry.distance && entry.fuelAmount && entry.fuelAmount > 0
  );

  if (validEntries.length === 0) {
    return 0;
  }

  const totalDistance = validEntries.reduce((sum, entry) => sum + entry.distance, 0);
  const totalFuel = validEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0);

  return calculateFuelEfficiency(totalDistance, totalFuel);
}

/**
 * Calculate fuel efficiency trend
 * @param {Array} fuelEntries - Array of fuel entries sorted by date
 * @param {number} windowSize - Number of entries to use for moving average (default: 5)
 * @returns {Array} Array of efficiency values
 */
function calculateEfficiencyTrend(fuelEntries, windowSize = 5) {
  if (!fuelEntries || fuelEntries.length < windowSize) {
    return [];
  }

  const trend = [];
  for (let i = windowSize - 1; i < fuelEntries.length; i++) {
    const window = fuelEntries.slice(i - windowSize + 1, i + 1);
    const efficiency = calculateAverageEfficiency(window);
    trend.push({
      date: fuelEntries[i].date,
      efficiency: efficiency,
      entries: window.length
    });
  }

  return trend;
}

/**
 * Calculate optimal fuel efficiency for different vehicle types
 * @param {string} vehicleType - Type of vehicle (car, bike, truck, etc.)
 * @returns {Object} Optimal efficiency ranges
 */
function getOptimalEfficiency(vehicleType) {
  const optimalRanges = {
    car: { min: 12, max: 25, unit: 'km/l' },
    bike: { min: 35, max: 60, unit: 'km/l' },
    truck: { min: 4, max: 8, unit: 'km/l' },
    suv: { min: 8, max: 15, unit: 'km/l' },
    van: { min: 10, max: 18, unit: 'km/l' }
  };

  return optimalRanges[vehicleType.toLowerCase()] || optimalRanges.car;
}

/**
 * Calculate carbon footprint from fuel consumption
 * @param {number} fuelAmount - Fuel consumed in liters
 * @param {string} fuelType - Type of fuel (petrol, diesel, cng)
 * @returns {number} CO2 emissions in kg
 */
function calculateCarbonFootprint(fuelAmount, fuelType = 'petrol') {
  if (!fuelAmount || fuelAmount <= 0) {
    return 0;
  }

  // CO2 emission factors (kg CO2 per liter)
  const emissionFactors = {
    petrol: 2.31,
    diesel: 2.68,
    cng: 2.75 // Compressed Natural Gas
  };

  const factor = emissionFactors[fuelType.toLowerCase()] || emissionFactors.petrol;
  return fuelAmount * factor;
}

/**
 * Calculate fuel cost for a trip
 * @param {number} distance - Trip distance in km
 * @param {number} efficiency - Fuel efficiency in km/l
 * @param {number} fuelPrice - Fuel price per liter
 * @returns {number} Estimated fuel cost
 */
function calculateTripCost(distance, efficiency, fuelPrice) {
  if (!distance || !efficiency || !fuelPrice || efficiency <= 0) {
    return 0;
  }

  const fuelNeeded = distance / efficiency;
  return fuelNeeded * fuelPrice;
}

/**
 * Calculate break-even point for fuel-efficient upgrades
 * @param {number} upgradeCost - Cost of the upgrade
 * @param {number} monthlySavings - Monthly fuel savings
 * @returns {number} Break-even period in months
 */
function calculateBreakEvenPeriod(upgradeCost, monthlySavings) {
  if (!upgradeCost || !monthlySavings || monthlySavings <= 0) {
    return Infinity;
  }

  return upgradeCost / monthlySavings;
}

/**
 * Calculate fuel efficiency rating
 * @param {number} efficiency - Current fuel efficiency
 * @param {string} vehicleType - Type of vehicle
 * @returns {Object} Rating object with grade and description
 */
function getEfficiencyRating(efficiency, vehicleType) {
  const optimal = getOptimalEfficiency(vehicleType);

  if (efficiency >= optimal.max) {
    return {
      grade: 'A+',
      description: 'Excellent efficiency',
      color: 'green'
    };
  } else if (efficiency >= optimal.max * 0.9) {
    return {
      grade: 'A',
      description: 'Very good efficiency',
      color: 'green'
    };
  } else if (efficiency >= optimal.max * 0.8) {
    return {
      grade: 'B',
      description: 'Good efficiency',
      color: 'yellow'
    };
  } else if (efficiency >= optimal.max * 0.7) {
    return {
      grade: 'C',
      description: 'Average efficiency',
      color: 'orange'
    };
  } else if (efficiency >= optimal.max * 0.6) {
    return {
      grade: 'D',
      description: 'Below average efficiency',
      color: 'red'
    };
  } else {
    return {
      grade: 'F',
      description: 'Poor efficiency - needs improvement',
      color: 'red'
    };
  }
}

module.exports = {
  calculateFuelEfficiency,
  calculateFuelConsumption,
  calculateCostPerKm,
  calculateCostPerLiter,
  calculatePotentialSavings,
  calculateAverageEfficiency,
  calculateEfficiencyTrend,
  getOptimalEfficiency,
  calculateCarbonFootprint,
  calculateTripCost,
  calculateBreakEvenPeriod,
  getEfficiencyRating
};
