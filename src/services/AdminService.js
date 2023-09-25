const mongoose = require("mongoose");
const MongooseService = require("../../foundation/services/MongooseService");
const jwt = require("jsonwebtoken");

const Admin = mongoose.model("admin");
const config = require("../../config/keys");

const admins = [
  {
    id: 1,
    firstName: "genie",
    lastName: "asia",
    email: "root@genie.com",
    password: "secret",
    registerDate: Date.now(),
  },
];

class AdminService {
  constructor() {
    this.MongooseServiceInstance = new MongooseService(Admin);
  }

  async create(adminToCreate) {
    try {
      const result = await this.MongooseServiceInstance.create(adminToCreate);
      return { success: true, body: result };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  async get() {
    try {
      const result = await this.MongooseServiceInstance.find({});
      return { success: true, body: result };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  async authenticate({ email, password }) {
    const user = admins.find(
      (u) => u.email === email && u.password === password
    );
    // const user = await this.MongooseServiceInstance.find(u => u.email === email && u.password === password);
    if (!user) throw "These credentials do not match our records.";
    // create a jwt token that is valid for 7 days
    const token = jwt.sign({ sub: user.id }, config.secret, {
      expiresIn: "7d",
    });

    return {
      ...omitPassword(user),
      token,
    };
  }
}

function omitPassword(user) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

module.exports = AdminService;
