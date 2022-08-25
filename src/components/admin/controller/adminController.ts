import { AppStrings } from "../../../utils/appStrings";
const Admin = require("../models/admin");
import { NextFunction, query, Request, Response } from "express";
import commonUtils, { fileFilter, fileStorage } from "../../../utils/commonUtils";
import Auth from "../../../auth";
import { AdminRole, UserType } from "../../../utils/enum";
import { AppConstants } from "../../../utils/appConstants";
import mongoose from "mongoose";
import { off } from "process";
const bcrypt = require("bcryptjs");
const config = require("config");
const multer = require("multer");
const upload = multer({ dest: "../../uploads/" });
const md5 = require("md5");
const User = require('../../users/models/userModel');

async function userList(req: Request, res: Response) {
  
    const users = await User.find()
    return commonUtils.sendSuccess(req, res, users, 200);
}



export default {
  userList
};