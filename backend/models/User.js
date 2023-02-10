const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    sureName: {
        type: String,
        required: [true, "Name required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email required"],
        unique: [true, "Email already exists"],
        trim: true,
        validate: [validator.isEmail, "Please enter valid email"]
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "Password should have minimum 8 characters."],
        select: false
    },
    verified: {
        type: Boolean,
        default: false
    },
});

// remove password before sending off
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;

    return userObject;
}

// hash password before save 
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 8)
})

// compare password while login 
userSchema.methods.comparePassword = async function (givenPassword) {
    return await bcrypt.compare(givenPassword, this.password);
}

// generate auth token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
}

//Generate email verification token
userSchema.methods.getVerificationToken = function () {
    const mailToken = crypto.randomBytes(20).toString("hex");

    return mailToken;
}

const User = mongoose.model("user", userSchema);

module.exports = User;