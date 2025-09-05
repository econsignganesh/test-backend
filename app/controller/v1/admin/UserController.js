const { Op } = require("sequelize");
const { tbl_adminusers: User } = require("../../../../models");

// Create User
exports.createUser = async (req, res) => {
  try {
    const {
      usertypeid,
      firstname,
      lastname,
      emailid,
      username,
      password,
      mobile,
      address,
      city,
      state,
      zipcode,
      gender,
      maritalstatus,
      nationality,
      dateofbirth
    } = req.body;

    if (!firstname || !lastname || !emailid || !username || !mobile) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const duplicate = await User.findOne({
      where: { EmailID: emailid, UserName: username, IsDeleted: false }
    });
    if (duplicate) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      UserTypeID: usertypeid,
      FirstName: firstname,
      LastName: lastname,
      EmailID: emailid,
      UserName: username,
      Password: password,
      Mobile: mobile,
      Address: address,
      City: city,
      State: state,
      ZipCode: zipcode,
      Gender: gender,
      MaritalStatus: maritalstatus,
      Nationality: nationality,
      DateOfBirth: dateofbirth,
      Status: true,
      IsDeleted: false,
      AddedOn: new Date()
    });

    return res.json({ message: "User created successfully", data: user });
  } catch (error) {
    console.error("createUser error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Edit User
exports.editUser = async (req, res) => {
  try {
    const { userid } = req.body;
    if (!userid) return res.status(400).json({ message: "UserID is required" });

    const user = await User.findOne({ where: { UserID: userid, IsDeleted: false } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Map small-case request data to PascalCase fields
    const updateData = {};
    if (req.body.firstname) updateData.FirstName = req.body.firstname;
    if (req.body.lastname) updateData.LastName = req.body.lastname;
    if (req.body.emailid) updateData.EmailID = req.body.emailid;
    if (req.body.username) updateData.UserName = req.body.username;
    if (req.body.mobile) updateData.Mobile = req.body.mobile;
    if (req.body.password) updateData.Password = req.body.password;
    if (req.body.address) updateData.Address = req.body.address;
    if (req.body.city) updateData.City = req.body.city;
    if (req.body.state) updateData.State = req.body.state;
    if (req.body.zipcode) updateData.ZipCode = req.body.zipcode;
    if (req.body.gender) updateData.Gender = req.body.gender;
    if (req.body.maritalstatus) updateData.MaritalStatus = req.body.maritalstatus;
    if (req.body.nationality) updateData.Nationality = req.body.nationality;
    if (req.body.dateofbirth) updateData.DateOfBirth = req.body.dateofbirth;

    await User.update(updateData, { where: { UserID: userid } });

    const updatedUser = await User.findOne({ where: { UserID: userid } });

    return res.json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.error("editUser error:", error);
    return res.status(500).json({ message: error.message });
  }
};



// Delete User (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const { userid } = req.body;
    if (!userid) return res.status(400).json({ message: "UserID is required" });

    const user = await User.findOne({ where: { UserID: userid, IsDeleted: false } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.update({ IsDeleted: true }, { where: { UserID: userid } });

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Toggle Status
exports.statusUser = async (req, res) => {
  try {
    const { userid } = req.body;
    if (!userid) return res.status(400).json({ message: "UserID is required" });

    const user = await User.findOne({ where: { UserID: userid, IsDeleted: false } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const newStatus = !user.Status;
    await User.update({ Status: newStatus }, { where: { UserID: userid } });

    return res.json({ message: "User status updated", status: newStatus });
  } catch (error) {
    console.error("statusUser error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get User Details
exports.getUserDetails = async (req, res) => {
  try {
    const { userid } = req.query;
    if (!userid) return res.status(400).json({ message: "UserID is required" });

    const user = await User.findOne({ where: { UserID: userid, IsDeleted: false } });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "User details fetched", data: user });
  } catch (error) {
    console.error("getUserDetails error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// List Users
exports.listUsers = async (req, res) => {
  try {
    const pageSize = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const offset = pageSize * (page - 1);
    const search = req.query.search || "";

    let whereCondition = { IsDeleted: 0 };
    if (search) {
      whereCondition[Op.or] = [
        { FirstName: { [Op.substring]: search } },
        { LastName: { [Op.substring]: search } },
        { EmailID: { [Op.substring]: search } },
        { UserName: { [Op.substring]: search } },
        { Mobile: { [Op.substring]: search } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereCondition,
      order: [["UserID", "DESC"]],
      limit: pageSize,
      offset: offset
    });

    return res.json({
      message: "Users fetched",
      users: users.rows,
      total: users.count,
      page,
      limit: pageSize
    });
  } catch (error) {
    console.error("listUsers error:", error);
    return res.status(500).json({ message: error.message });
  }
};
