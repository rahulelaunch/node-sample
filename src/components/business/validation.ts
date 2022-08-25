import {NextFunction, Request, Response} from "express"
import validator from "../../utils/validate";
import commonUtils from "../../utils/commonUtils";
import {AdminRole, Device, Gender, ProviderType, UserData, UserType} from "../../utils/enum";
import {AppStrings} from "../../utils/appStrings";
import {AppConstants} from "../../utils/appConstants";
import mongoose from "mongoose";
import {phone} from "phone";

//sample
// const User = require('./models/businessModel');
const Business = require('./models/businessModel');

const hasBusinessValidation = async (req: Request, res: Response, next: NextFunction) => {
    const businessId = req.headers.businessid as string;
    if (!businessId || ! mongoose.Types.ObjectId.isValid(businessId))
        return commonUtils.sendError(req, res, {message: AppStrings.BUSINESSID_MISSING}, 404);

    const business = await Business.findById(businessId);
    if (!business) return commonUtils.sendError(req, res, {message: AppStrings.BUSINESS_NOT_FOUND}, 409);

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
const settingValidation = async (req: Request, res: Response, next: NextFunction) => {

    const ValidationRule: any = {
        "permissions.location": {
            "whileUsingApp": "boolean",
            "withLinkedContact": "boolean",
            "withPublic": "boolean",
            "notShared": "boolean",
        },
        "permissions.visibility":{
            "picture":"boolean",
            "status":"boolean",
            "post":"boolean",
        },
        "permissions.acceptMessage":{
            "public":"boolean",
            "contact":"boolean",
            "marketing":"boolean"
        }
    }
    validator.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
}

const createBusinessValidation = async (req: Request, res: Response, next: NextFunction) => {

    const validationRule :any = {
        "bio":"required|string",
        "businessStatus":"required|string",
        "name":"required|string",
        "image":"required|string",
        "mobile":"valid_phone|exist:Business,mobile",
        "email":"string|email|max:255|exist:Business,email",
        "secondary":"valid_phone|different:mobile|different:alternative|exist:Business,mobile|exist:Business,optionalMobile.secondary|exist:Business,optionalMobile.alternative,",
        "alternative":"valid_phone|different:mobile|different:secondary|exist:Business,mobile|exist:Business,optionalMobile.secondary,|exist:Business,optionalMobile.alternative,",
        "address":"required",
        "address.name" : "required",
        "address.longitude" : "required|numeric|min:-180|max:180",
        "address.latitude" :"required|numeric|min:-180|max:180",
    }

    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);

}

const refrenceValidation = async (req: Request, res: Response, next: NextFunction) => {
    const validationRule = {
        "reference": [{
            'array': true,
        }],
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}
const advertisementValidation = async (req: Request, res: Response, next: NextFunction) => {
    const validationRule = {
        "message": "required|string",
        "image": "required|string",
        "video": "required",
        "audio": "required",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

const verifyDocumentValidation = async (req: Request, res: Response, next: NextFunction) => {
    const businessId = req.headers.businessid;
    let ValidationRule: any = {
        "registrationNumber": "required|string",
        "image": "required|string",
        "address": "required",
        "address.name": "required",
        "address.longitude": "required",
        "address.latitude": "required",
        "secondaryNumber":`valid_phone|required|exist_value:Business,mobile,${businessId}|exist_value:Business,optionalMobile.secondary,${businessId}|exist_value:Business,optionalMobile.alternative,${businessId}`,
    }
    validator.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
}

export default {
    hasBusinessValidation,
    locationValidation,
    createBusinessValidation,
    settingValidation,
    verifyDocumentValidation,
    advertisementValidation,
    refrenceValidation
}