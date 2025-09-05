const { tbl_adminusers: User } = require("../../../../models");
const { Op } = require("sequelize");

exports.login = async (req, res) => {
  try {
    const { emailid, password } = req.body;

    // Basic validation
    if (!emailid || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({
      where: { EmailID: emailid, IsDeleted: false }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    if (user.Password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Login successful
    return res.json({
      message: "Login successful",
      data: {
        UserID: user.UserID,
        FirstName: user.FirstName,
        LastName: user.LastName,
        EmailID: user.EmailID,
        UserName: user.UserName,
        Mobile: user.Mobile
      }
    });

  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
