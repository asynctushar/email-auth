const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const User = require('../models/User');
const Token = require('../models/Token');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const sendToken = require('../utils/sendToken');


// sign up
exports.createUser = catchAsyncErrors(async (req, res, next) => {
    const { sureName, email, password } = req.body;

    if (password.length < 8) {
        return next(new ErrorHandler("Password should be at least 8 characters.", 400))
    }

    const user = await User.create({
        sureName,
        email,
        password
    });

    const emailToken = user.getVerificationToken();
    const token = await Token.create({
        userId: user.id,
        token: emailToken
    });

    let verifyUrl = `${req.protocol}://${req.get("host")}/email/verify/${emailToken}`;

    if (process.env.NODE_ENV !== "PRODUCTION") {
        verifyUrl = `${process.env.FRONTEND_URL}/email/verify/${emailToken}`;
    }

    const message = `Please verify your email on sample.com : \n\n ${verifyUrl} \n\n If you have not requested this then please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: "sample.com email verification",
            message
        });

        res.status(200).json({
            success: true,
            message: `A verification email sent to ${user.email}.`
        })
    } catch (err) {
        await token.delete();

        return next(new ErrorHandler(err.message, 500))
    }

})

// verify email
exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
    const token = await Token.findOne({
        token: req.params.token
    })

    if (!token) {
        return next(new ErrorHandler('Verify token is invalid or has been expired.', 404));
    }

    const user = await User.findById(token.userId);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    user.verified = true;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Email has been verified"
    })
});


// login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email and Password.", 400))
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password.", 401))
    }

    const isMatchPassword = await user.comparePassword(password);
    if (!isMatchPassword) {
        return next(new ErrorHandler("Invalid Email or Password.", 401))
    }

    if (!user.verified) {
        return next(new ErrorHandler("Please verify email.", 401))
    }

    sendToken(user, 200, res);
})

//Get user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
        success: true,
        user: req.user
    })
})

//Logout  user
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logged Out"
    })
})