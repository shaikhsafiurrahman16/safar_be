const db = require('../config/db');

exports.getFuelReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const [report] = await db.query(
      `SELECT 
        v.name AS vehicle,
        f.liters,
        f.price,
        f.distance,
        (f.distance / f.liters) AS mileage,
        f.created_at
       FROM fuel_logs f
       JOIN vehicles v ON v.id = f.vehicle_id
       WHERE f.user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      report
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};