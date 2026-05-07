const db = require('../config/db');

// ADD FUEL LOG
exports.addFuel = async (req, res) => {
  try {
    const { vehicle_id, liters, price, distance } = req.body;

    await db.query(
      "INSERT INTO fuel_logs (vehicle_id, user_id, liters, price, distance) VALUES (?, ?, ?, ?, ?)",
      [vehicle_id, req.user.id, liters, price, distance]
    );

    res.json({
      success: true,
      message: "Fuel log added"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET FUEL LOGS
exports.getFuelLogs = async (req, res) => {
  try {
    const [logs] = await db.query(
      "SELECT * FROM fuel_logs WHERE user_id = ?",
      [req.user.id]
    );

    res.json({
      success: true,
      logs
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};