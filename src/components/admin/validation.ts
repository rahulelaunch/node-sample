import { NextFunction, Request, Response } from "express"
import validator from "../../utils/validate";
import commonUtils from "../../utils/commonUtils";
import { AdminRole } from "../../utils/enum";
import { AppStrings } from "../../utils/appStrings";
import { AppConstants } from "../../utils/appConstants";
import mongoose from "mongoose";
const Admin = require('./models/admin');

const adminRoles = Object.values(AdminRole).filter(value => typeof value === 'number');

async function adminregisterValidation(req: Request, res: Response, next: NextFunction) { 
    
    const validationRule = {
        "username": `required|string|exist:${AppConstants.MODEL_ADMIN},username`,
        "email": `required|string|min:4|max:255|exist:${AppConstants.MODEL_ADMIN},email`,
        "mobile": `required|min:10|exist:${AppConstants.MODEL_ADMIN},mobile`,
        "password": "required|min:4|max:50",
        "adminrole": "required|in:" + adminRoles.join(","),
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

async function adminUpdateValidation(req: Request, res: Response, next: NextFunction) {    
    const role = req.headers.adminrole as string
    const userId = req.headers.userid as string
    
    console.log(role,userId);
   
    let adminRole_ =  parseInt(role) !== AdminRole.SUPER_ADMIN ? adminRoles.filter(role => role !== AdminRole.SUPER_ADMIN) : adminRoles
    
    console.log(adminRole_);
    
    const validationRule = {
        "username": `required|string|exist_value:${AppConstants.MODEL_ADMIN},username,${req.body.admin_id}`,
        "email": `required|string|min:4|max:255|exist_value:${AppConstants.MODEL_ADMIN},email,${req.body.admin_id}`,
        "adminrole": "required|in:" + adminRole_.join(","),
        "mobile": `required|min:10|exist_value:${AppConstants.MODEL_ADMIN},mobile,${req.body.admin_id}`,
        "admin_id": "required|string|validObjectId",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

async function loginValidation(req: Request, res: Response, next: NextFunction) {
    const adminroles = [ AdminRole.SUPER_ADMIN];

    const validationRule = {
        "email": "required",
        "password": "required|min:4|max:50",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}
async function changePasswordValidation(req: any, res: any, next: NextFunction) {
    const validationRule = {
        "admin_id": "required|string|validObjectId",
        "old_password": "required",
        "new_password": "required|min:4|max:50|different:old_password",
    }
    
    validator.validatorUtilWithCallback(validationRule, {"different.new_password":"New password and old Password must be diffrent"}, req, res, next);
}


const hasAdminValidation = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.headers.adminid as string;
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId))
        return commonUtils.sendAdminError(req, res, { message: AppStrings.ADMINID_MISSING }, 404);

    const admin = await Admin.findById(adminId);
    if (!admin) return commonUtils.sendAdminError(req, res, { message: AppStrings.ADMIN_NOT_FOUND }, 409);

    next();
}

async function JobCategoryValidation(req: Request, res: Response, next: NextFunction) {
    const validationRule = {
        "title": `required|string|exist:${AppConstants.MODEL_JOBS_CATEGORY},title`,
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

async function setJobCategoryValidation(req: Request, res: Response, next: NextFunction) {
    const validationRule = {
        "category_id": "required|string|validObjectId",
        "title": `required|string|exist_value:${AppConstants.MODEL_JOBS_CATEGORY},title,${req.body.category_id}`,
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}


async function jobCancelValidation(req: Request, res: Response, next: NextFunction) {

    const validationRule = {
        "reason_id": "required|string|validObjectId",
        "reason": `required|string|exist_value:${AppConstants.MODEL_JOB_CANCEL},reason,${req.body.reason_id}`,
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

async function referalValidation(req: Request, res: Response, next: NextFunction) {
    const validationRule = {
        "user_id": "required|string|validObjectId",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

async function balanceValidation(req: Request, res: Response, next: NextFunction) {
    const validationRule = {
        "user_id": "required|string|validObjectId",
        "provider_id": "required|string|validObjectId",
        "referal_code": "required|string",
        "amount": "required|numeric",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

async function loginAccessValidation(req: Request, res: Response, next: NextFunction) {
    const validationRule = {
        "admin_id": "required|string|validObjectId",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

async function isSuperAdmin(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers.userid as string;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId))
        return commonUtils.sendAdminError(req, res, { message: AppStrings.ADMINID_MISSING }, 404);

    const admin = await Admin.findById(userId);
    if (!admin) return commonUtils.sendAdminError(req, res, { message: AppStrings.ADMIN_NOT_FOUND }, 409);

    if (parseInt(admin.adminrole) !== AdminRole.SUPER_ADMIN) {
        return commonUtils.sendAdminError(req, res, { message: AppStrings.NOT_AUTHORIZED }, 409);
    }
    next();
}

async function disputeValidation(req: Request, res: Response, next: NextFunction) {
    const validationRule = {
        "dispute_id": "required|string|validObjectId",
        "disputeStatus": `required|string`,
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}


export default {
    loginAccessValidation,
    adminregisterValidation,
    adminUpdateValidation,
    changePasswordValidation,
    loginValidation,
    hasAdminValidation,
    JobCategoryValidation,
    setJobCategoryValidation,
    jobCancelValidation,
    referalValidation,
    balanceValidation,
    isSuperAdmin,
    disputeValidation,
}