const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
}, );

// Middleware hashPassword register
UserSchema.pre("save", async function (next) {
  try {
    console.log(`Called before save::`, this.email, this.password);
    const salt = await bcrypt.genSalt(10); // Băm 
    const hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
    next();
  } catch (error) {
    next(error)
  }
})

//Check password by hashPassword compare login
UserSchema.methods.isCheckPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password)
  } catch (error) {
    next(error);
  }
}

module.exports = mongoose.model("user", UserSchema);