const db = require('../config/db');

// USER DASHBOARD
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [vehicleCount] = await db.query(
      "SELECT COUNT(*) AS totalVehicles FROM vehicles WHERE user_id = ?",
      [userId]
    );

    const [fuelLogs] = await db.query(
      "SELECT COUNT(*) AS totalLogs FROM fuel_logs WHERE user_id = ?",
      [userId]
    );

    const [totalCost] = await db.query(
      "SELECT SUM(price) AS cost FROM fuel_logs WHERE user_id = ?",
      [userId]
    );

    const [avgMileage] = await db.query(
      "SELECT AVG(distance / liters) AS mileage FROM fuel_logs WHERE user_id = ?",
      [userId]
    );

    res.json({
      success: true,
      data: {
        totalVehicles: vehicleCount[0].totalVehicles,
        totalFuelLogs: fuelLogs[0].totalLogs,
        totalFuelCost: totalCost[0].cost || 0,
        avgMileage: avgMileage[0].mileage || 0
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
