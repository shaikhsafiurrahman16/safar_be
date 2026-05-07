const db = require('../config/db');

// ADD VEHICLE
exports.addVehicle = async (req, res) => {
  try {
    const { name, type, fuel_type } = req.body;

    await db.query(
      "INSERT INTO vehicles (user_id, name, type, fuel_type) VALUES (?, ?, ?, ?)",
      [req.user.id, name, type, fuel_type]
    );

    res.json({
      success: true,
      message: "Vehicle added successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER VEHICLES
exports.getVehicles = async (req, res) => {
  try {
    const [vehicles] = await db.query(
      "SELECT * FROM vehicles WHERE user_id = ?",
      [req.user.id]
    );

    res.json({
      success: true,
      vehicles
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};