import {NextFunction, Request, Response} from "express"
import validator from "../../utils/validate";
import commonUtils from "../../utils/commonUtils";
import {AdminRole, Device, Gender, ProviderType, UserData, UserType} from "../../utils/enum";
import {AppStrings} from "../../utils/appStrings";
import mongoose from "mongoose";

const User = require('./models/userModel');

const hasUserValidation = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers.userid as string;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId))
        return commonUtils.sendError(req, res, {message: AppStrings.USERID_MISSING}, 404);

    const user = await User.findById(userId);
    if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_NOT_FOUND}, 409);

    next();
}

const locationValidation = async (req: Request, res: Response, next: NextFunction) => {

    const ValidationRule: any = {
        "location": {
            "longitude": "required|numeric|min:-180|max:180",
            "latitude": "required|numeric|min:-90|max:90",
        },
    }
    validator.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
}
const settingProfileValidation = async (req: Request, res: Response, next: NextFunction) => {

    const ValidationRule: any = {
        "location": {
            "whileUsingApp": "boolean",
            "withLinkedContact": "boolean",
            "withPublic": "boolean",
            "notShared": "boolean",
        },
        "visibility":{
            "picture":"boolean",
            "status":"boolean",
            "post":"boolean",
        },
        "acceptMessage":{
            "public":"boolean",
            "contact":"boolean",
            "marketing":"boolean"
        }
    }
    validator.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
}

const complateProfileValidation = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers.userid;
    const validationRule :any = {
        "bio":"required|string",
        "userStatus":"required|string",
        "fullName":"required|string",
        "userName":`required|string|exist_value:User,userName,${userId}`,
        "mobile":`valid_phone|exist_value:User,mobile,${userId}`,
        "email":`string|email|max:255|exist_value:User,email,${userId}`,
        "secondary":`valid_phone|different:mobile|different:alternative|exist_value:User,mobile,${userId}|exist_value:User,optionalMobile.secondary,${userId}|exist_value:User,optionalMobile.alternative,${userId}`,
        "alternative":`valid_phone|different:mobile|different:secondary|exist_value:User,mobile,${userId}|exist_value:User,optionalMobile.secondary,${userId}|exist_value:User,optionalMobile.alternative,${userId}`,
        "address":"required",
        "address.name" : "required",
        "address.longitude" : "required|numeric|min:-180|max:180",
        "address.latitude" :"required|numeric|min:-180|max:180",
    }

    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);

}

const refrenceValidation = async (req: Request, res: Response, next: NextFunction) => {    
    const validationRule = {
        "reference.*.name": "required|string",
        "reference.*.email": "required|email|different:reference.*.email",
        "reference.*.mobile": "required|valid_phone|different:reference.*.mobile",
    }

    const uniqueMobile = [...new Set(req.body.map((item:any) => item.mobile))];
    if(uniqueMobile.length !== req.body.length) return commonUtils.sendError(req,res, {error:AppStrings.MOBILE_SHOULD_BE_UNIQUE})

    const uniqueEmail = [...new Set(req.body.map((item:any) => item.email))];
    if(uniqueEmail.length !== req.body.length) return commonUtils.sendError(req,res, {error:AppStrings.EMAIL_SHOULD_BE_UNIQUE})

    validator.validatorUtil({reference: req.body},validationRule,{}, (err:any,success:any) => {
        if(err){
            return commonUtils.sendError(req, res, {errors: commonUtils.formattedErrors(err)})
        }
        if(success){
           next()
        }
    })
}

//TODO: is your primary number link with document number [checkbox]
const documentProfileValidation = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers.userid;
    let ValidationRule: any = {
            "idNumber": "required|string",
            "image": "required|string",
            "idVerifyImage": "required|string",            
            "homeAddress": "required",
            "homeAddress.name": "required",
            "homeAddress.longitude": "required",
            "homeAddress.latitude": "required",
            "secondaryNumber":`valid_phone|exist_value:User,mobile,${userId}|exist_value:User,optionalMobile.secondary,${userId}|exist_value:User,optionalMobile.alternative,${userId}`,
    }
    validator.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
}

export default {
    hasUserValidation,
    locationValidation,
    complateProfileValidation,
    settingProfileValidation,
    documentProfileValidation,
    refrenceValidation
}