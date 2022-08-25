import {AppStrings} from "../../utils/appStrings";

const User = require('../users/models/userModel');
const Token = require("./tokenModel");
import {NextFunction, Request, Response} from "express";
import commonUtils from "../../utils/commonUtils";
import {Device, UserData, UserType} from "../../utils/enum";
import mongoose, {ObjectId} from "mongoose";

const bcrypt = require("bcryptjs");
const config = require("config");
import Auth from "../../auth";
import crypto from "crypto";
import eventEmitter from "../../utils/event";
import Phone from "../phone"

async function register(req: Request, res: Response) {
    
    const user = new User({
        fullName: req.body.fullName,
        email: req.body.userName?.[UserData.EMAIL.toString()],
        mobile: req.body.userName?.[UserData.MOBILE.toString()],
        password: req.body.password,
        pushToken: req.body.pushToken,
        device: req.body.device,
    });

    if (!user.email && !user.mobile) 
    return commonUtils.sendError(req, res, {errors: {"userName": AppStrings.EMAIL_MOBILE_REQUIRED}}, 400);
    // hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    // eventEmitter.emit('user.checkForSelfEndorsed', {userId: user._id})

    if (user.email) {
        await sendVerifyOTP(user._id, user.email, user.device, 'email', 'forSignUp', 'please verify your email')
        return commonUtils.sendSuccess(req, res, {message: AppStrings.CHECK_MAIL})
    } else if (user.mobile) {
        await sendVerifyOTP(user._id, user.mobile, user.device, 'mobile', 'forSignUp', 'please verify your mobile')
        return commonUtils.sendSuccess(req, res, {message: AppStrings.CHECK_PHONE})
    } else {
        return commonUtils.sendError(req, res, {message: AppStrings.USER_CREDENTIAL_DOES_NOT_MATCH})
    }
}

async function login(req: Request, res: Response) {
    const email = req.body.userName[UserData.EMAIL.toString()];
    const mobile = req.body.userName[UserData.MOBILE.toString()];
    const password = req.body.password;    
    const device = req.body.device ?? 3;
    const terminateSession = req.body.terminateSession || false;

    if (!email && !mobile) return commonUtils.sendError(req, res, {message: AppStrings.EMAIL_MOBILE_REQUIRED}, 400);

    const find_filed = email ? {email: email} : {mobile: mobile};

    const user = await User.findOne(find_filed);
    if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_CREDENTIAL_DOES_NOT_MATCH}, 409);

    const valid_password = await bcrypt.compare(password, user.password);
    if (!valid_password) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return commonUtils.sendError(req, res, {message: AppStrings.INVALID_PASSWORD}, 409);
    }

    if (!user.isVerify || parseInt(user.isVerify) === 0) {
        if (email) {
            await sendVerifyOTP(user._id, email, user.device, 'email', 'forSignUp', 'Your email has been verified')
            return commonUtils.sendSuccess(req, res, {isVerify: 0})
        }
        if (mobile) {
            await sendVerifyOTP(user._id, mobile, user.device, 'mobile', 'forSignUp', 'Your mobile has been verified')
            return commonUtils.sendSuccess(req, res, {isVerify: 0})
        }
    }

    if (device !== Device.WEB && !terminateSession) {
        const [noPreviousToken, errOnPreviousToken] = await Auth.checkSession(user._id, UserType.CUSTOMER, user.createdAt, device);

        if (errOnPreviousToken) {
            return commonUtils.sendSuccess(req, res, {message: errOnPreviousToken, type: 2});
        }
    }

    const response_ = await Auth.login(user._id, UserType.CUSTOMER, user.createdAt, device);
    await User.findByIdAndUpdate(user._id, {$set: {lastLogin: new Date()}}).exec();

    res.cookie("accessToken", response_.accessToken, {maxAge: 900000, httpOnly: true});
    res.cookie("refreshToken", response_.refreshToken, {maxAge: 900000, httpOnly: true});

    const responseObj = {
        usertype: user.usertype,
        isProfileComplete: user.isProfileComplete,
        accessToken: response_.accessToken,
        isVerify: user.isVerify,
        user: {
            displayName: user.fullName,
            userName: user.userName,
            _id: user._id,
            email: user.email,
            mobile: user.mobile,
        },
    }

    return commonUtils.sendSuccess(req, res, responseObj);
}

async function sendVerifyOTP(userId: ObjectId, credential: any, device: any, median: string, reason: any, subject: string,) {
    const otp = 1111; //TODO: logic wise genrate
    if (median === 'mobile') {
        eventEmitter.emit("send_phone_otp", {to: credential});
    } else if (median === 'email') {
        eventEmitter.emit("send_email_otp", {
            to: credential,
            subject: subject,
            data: {
                otp: 1111,
                message: "Your email has been verified",
            },
        });
    } else {
        return [null, 'not valid type']
    }

    let resetToken = crypto.randomBytes(64).toString("hex");
    resetToken = await genrateUniqueToken(resetToken);
    const hash_ = await bcrypt.hash(resetToken, Number(config.get("saltRounds")));

    await Token.deleteOne({userId});

    const tokenData = new Token({
        userId: userId,
        otp: otp,
        token: hash_,
        device: device,
        forSignUp: reason === 'forSignUp'
    });

    await tokenData.save();
}

async function methodAllowance(req: any, res: Response) {
    return commonUtils.sendError(req, res, {message: "Request method now allowed."}, 405);
}

async function forgotPassword(req: any, res: Response) {
    const token = req.body.token;
    const password = req.body.password;
    const device = req.body.device;

    const token_ = await Token.findOne({token: token, isVerified: true, device: device}).exec();
    if (!token_) return commonUtils.sendError(req, res, {message: AppStrings.INVALID_TOKEN}, 409);

    const user = await User.findById(token_.userId).exec();
    if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_NOT_FOUND}, 409);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.updateOne({password: user.password}).exec();

    await Token.deleteOne({token: token}).exec();

    // TODO blackList old tokens

    return commonUtils.sendSuccess(req, res, {message: AppStrings.PASSWORD_CHANGED,}, 200);
}

async function changePassword(req: any, res: Response) {
    const user_id = req.headers.userid;
    const old_password = req.body.old_password;
    const new_password = req.body.new_password;

    const user = await User.findById(user_id).exec();
    if (!user)
        return commonUtils.sendError(req, res, {message: AppStrings.USER_NOT_FOUND}, 409);

    const valid_password = await bcrypt.compare(old_password, user.password);
    if (!valid_password)
        return commonUtils.sendError(req, res, {message: AppStrings.INVALID_PASSWORD}, 409);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    await user.updateOne({password: user.password}).exec();

    // TODO blackList old tokens

    return commonUtils.sendSuccess(req, res, {message: AppStrings.PASSWORD_CHANGED,}, 200);
}

async function getOTP(req: Request, res: Response) {
    const email = req.body.userName?.[UserData.EMAIL.toString()];
    const mobile = req.body.userName?.[UserData.MOBILE.toString()];
    const device = req.body.device;

    if (!email && !mobile) return commonUtils.sendError(req, res, {message: AppStrings.EMAIL_MOBILE_REQUIRED}, 400);

    let find_filed;
    if (email) {
        find_filed = {email: email};
    } else {
        find_filed = {mobile: mobile};
    }

    const user = await User.findOne(find_filed).exec();
    if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_CREDENTIAL_DOES_NOT_MATCH}, 409);

    if (email) {
        await sendVerifyOTP(user._id, user.email, device, 'email', 'forForgotPassword', 'Your otp has been verified')
        return commonUtils.sendSuccess(req, res, {message: AppStrings.CHECK_MAIL})
    } else if (mobile) {
        await sendVerifyOTP(user._id, user.mobile, device, 'mobile', 'forForgotPassword', 'Your Otp has been verified')
        return commonUtils.sendSuccess(req, res, {message: AppStrings.CHECK_PHONE})
    } else {
        return commonUtils.sendError(req, res, {message: AppStrings.USER_CREDENTIAL_DOES_NOT_MATCH})
    }
}

async function resendOTP(req: Request, res: Response) {
    const email = req.body.userName?.[UserData.EMAIL.toString()];
    const mobile = req.body.userName?.[UserData.MOBILE.toString()];
    const device = req.body.device;
    const reason = req.body.reason;

    if (!['forSignUp', 'forForgotPassword'].includes(reason)) {
        return commonUtils.sendError(req, res, {message: AppStrings.INVALID_REASON})
    }

    if (!email && !mobile) return commonUtils.sendError(req, res, {message: AppStrings.EMAIL_MOBILE_REQUIRED}, 400);

    let find_filed;
    if (email) {
        find_filed = {email: email};
    } else {
        find_filed = {mobile: mobile};
    }

    const user = await User.findOne(find_filed).exec();
    if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_CREDENTIAL_DOES_NOT_MATCH}, 409);

    if (user.email) {
        await sendVerifyOTP(user._id, user.email, device, 'email', reason, 'Your otp has been verified')
        return commonUtils.sendSuccess(req, res, {message: AppStrings.CHECK_MAIL})
    } else if (user.mobile) {
        await sendVerifyOTP(user._id, user.mobile, device, 'mobile', reason, 'Your Otp has been verified')
        return commonUtils.sendSuccess(req, res, {message: AppStrings.CHECK_PHONE})
    } else {
        return commonUtils.sendError(req, res, {message: AppStrings.USER_CREDENTIAL_DOES_NOT_MATCH})
    }

}

async function genrateUniqueToken(token_: string) {
    let token = token_;
    let count = 0;
    while (true) {
        const token_ = await Token.findOne({token: token});
        if (!token_) break;
        count += 1;
        token = token_ + count;
    }
    return token;
}

async function verifyOTP(req: Request, res: Response) {
    const otp = req.body.otp;
    const device = req.body.device;
    const email = req.body.userName?.[UserData.EMAIL.toString()];
    const mobile = req.body.userName?.[UserData.MOBILE.toString()];

    if (!email && !mobile) return commonUtils.sendError(req, res, {message: AppStrings.EMAIL_MOBILE_REQUIRED}, 400);

    let find_filed;
    if (email) {
        find_filed = {email: email};
    } else {
        find_filed = {mobile: mobile};
    }

    const user = await User.findOne(find_filed).exec();
    if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_CREDENTIAL_DOES_NOT_MATCH}, 409);

    if (mobile) {
        const [success, err] = await Phone.verifyPhoneOtp(mobile, otp)
        if (success) {
            const token = await Token.findOne({userId: new mongoose.Types.ObjectId(user._id), device: device, forSignUp: false});
            if (!token) return commonUtils.sendError(req, res, {message: AppStrings.INCORRECT_OTP}, 400);

            token.isVerified = true;
            await token.save();

            return commonUtils.sendSuccess(req, res, {token: token.token}, 200);
        }
        if (err) {
            return commonUtils.sendError(req, res, {message: err}, 409);
        }
    } else {
        const token = await Token.findOne({
            userId: new mongoose.Types.ObjectId(user._id),
            otp: otp,
            device: device,
            forSignUp: false
        });
        if (!token) return commonUtils.sendError(req, res, {message: AppStrings.INCORRECT_OTP}, 400);

        // increase request count
        token.requestCount += 1;
        await token.updateOne({requestCount: token.requestCount});

        // check if otp is valid
        if (token.requestCount > 3) return commonUtils.sendError(req, res, {message: AppStrings.OTP_REQUEST_LIMIT}, 400);
        if (token.isVerified) return commonUtils.sendError(req, res, {message: AppStrings.OTP_ALREADY_VERIFIED}, 400);
        if (token.otp !== otp) return commonUtils.sendError(req, res, {message: AppStrings.INVALID_OTP}, 400);

        token.isVerified = true;
        await token.save();

        return commonUtils.sendSuccess(req, res, {token: token.token}, 200);
    }

}

// send email to user verify singup 
async function signupVerifyOTP(req: Request, res: Response) {
    const otp = req.body.otp;
    const device = req.body.device;
    const email = req.body.userName?.[UserData.EMAIL.toString()];
    const mobile = req.body.userName?.[UserData.MOBILE.toString()];

    if (!email && !mobile) return commonUtils.sendError(req, res, {message: AppStrings.EMAIL_MOBILE_REQUIRED}, 400);

    let find_filed;
    if (email) {
        find_filed = {email: email};
    } else {
        find_filed = {mobile: mobile};
    }

    const user = await User.findOne(find_filed).exec();
    if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_CREDENTIAL_DOES_NOT_MATCH}, 409);
    
    if (user.isVerify) return commonUtils.sendError(req,res,{message:AppStrings.OTP_ALREADY_VERIFIED})

    if (mobile) {
        const [success, err] = await Phone.verifyPhoneOtp(mobile, otp)
        if (err) {
            return commonUtils.sendError(req, res, {message: err}, 409);
        }
        if (success) {            
            user.isVerify = 1;
            await user.save();
            await Token.findOneAndUpdate({
                userId: new mongoose.Types.ObjectId(user._id),             
                device: device,
                forSignUp: true
            },{$set:{isVerified:true}})
        }
    } else {
        const token = await Token.findOne({
            userId: new mongoose.Types.ObjectId(user._id),
            otp: otp,
            device: device,
            forSignUp: true
        });
        if (!token) return commonUtils.sendError(req, res, {message: AppStrings.INCORRECT_OTP}, 400);

        // increase request count
        token.requestCount += 1;
        await token.updateOne({requestCount: token.requestCount});

        // check if otp is valid
        if (token.requestCount > 3) return commonUtils.sendError(req, res, {message: AppStrings.OTP_REQUEST_LIMIT}, 400);
        if (token.isVerified) return commonUtils.sendError(req, res, {message: AppStrings.OTP_ALREADY_VERIFIED}, 400);
        if (token.otp != otp) return commonUtils.sendError(req, res, {message: AppStrings.INVALID_OTP}, 400);

        token.isVerified = true;
        await token.updateOne({isVerified: token.isVerified});

        user.isVerify = 1;
        await user.save()
    }
    
    const response_ = await Auth.login(user._id, UserType.CUSTOMER, user.createdAt, device);

    res.cookie("accessToken", response_.accessToken, {maxAge: 900000, httpOnly: true});
    res.cookie("refreshToken", response_.refreshToken, {maxAge: 900000, httpOnly: true});

    const responseObj = {
        isProfileComplete: user.isProfileComplete,
        usertype: user.usertype,
        isVerify: user.isVerify,
        accessToken: response_.accessToken,
        user: {
            displayName: user.fullName,
            userName: user.userName,
            _id: user._id,
            email: user.email,
            mobile: user.mobile,
        },
    }
    return commonUtils.sendSuccess(req, res, responseObj);


}

async function checkUnique(req: any, res: Response) {
    return commonUtils.sendSuccess(req, res, {});
}

export default {
    register,
    login,
    methodAllowance,
    forgotPassword,
    changePassword,
    getOTP,
    verifyOTP,
    signupVerifyOTP,
    resendOTP,
    checkUnique,
};
