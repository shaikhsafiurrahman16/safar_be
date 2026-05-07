const db = require('../config/db');

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const [user] = await db.query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [req.user.id]
    );

    res.json({
      success: true,
      user: user[0]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};