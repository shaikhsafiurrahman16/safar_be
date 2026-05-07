const db = require('../config/db');

// GET ALL USERS
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role FROM users"
    );

    res.json({
      success: true,
      users
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM users WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "User deleted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ALL SYSTEM STATS
exports.systemStats = async (req, res) => {
  try {
    const [users] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [vehicles] = await db.query("SELECT COUNT(*) AS totalVehicles FROM vehicles");
    const [fuel] = await db.query("SELECT SUM(price) AS totalFuelCost FROM fuel_logs");

    res.json({
      success: true,
      data: {
        totalUsers: users[0].totalUsers,
        totalVehicles: vehicles[0].totalVehicles,
        totalFuelCost: fuel[0].totalFuelCost || 0
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
