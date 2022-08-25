import {NextFunction, Request, Response} from "express"
import {AppStrings} from "../../utils/appStrings";
import commonUtils from "../../utils/commonUtils";

const config = require("config")
const jwt = require('jsonwebtoken')
import redisClient from "../../utils/redisHelper"; 
import aes from "../../utils/aes";
import { Device } from "../../utils/enum";
const Admin = require('../../components/admin/models/admin');

async function verifyToken(req: any, res: Response, next: Function) {
    let tokens_ = req.headers?.authorization?.split(' ') ?? []
    

    return new Promise((resolve, reject) => {
        if(tokens_.length <= 1){
            reject(AppStrings.INVALID_TOKEN);
        }
        const token = tokens_[1];
        jwt.verify(token, config.get("JWT_ACCESS_SECRET"), async (err: any, user: any) => {
            if (err) {
                if (err.name == "TokenExpiredError") {
                    reject(AppStrings.TOKEN_EXPIRED);
                } else {
                    reject(AppStrings.INVALID_SESSION);
                }
            } else {
                let midLayer = aes.decrypt(user.sub, config.get("OUTER_KEY_PAYLOAD"))
                const userData = JSON.parse(aes.decrypt(midLayer.toString(), config.get("OUTER_KEY_USER")));
                const userObj = { userid : userData.userId}           
                let blackListed: [] = await redisClient.lrange('BL_' + midLayer.toString(), 0, -1)
                let blackListed_ = blackListed.find(value => value == token)
   
                if (userData?.device !== Device.WEB) {
                    let oldValue = await redisClient.get("m_"+ midLayer.toString())

                    let token_

                    if (oldValue) {
                        token_ = JSON.parse(oldValue)?.accessToken === token
                    }

                    if (blackListed_ && !token_) {
                        reject(AppStrings.BLACKLISTED_TOKEN);
                    } else {
                        resolve(userObj);
                    }


                } else {
                    let tokens: [] = await redisClient.lrange("w_"+midLayer.toString(), 0, -1)
                    let token_ = tokens.find(value => JSON.parse(value).accessToken.toString() == token.toString())

                    if (blackListed_ && !token_) {
                        reject(AppStrings.BLACKLISTED_TOKEN);
                    } else {
                        resolve(userObj);
                    }
                }
            }
        })
    }).then((userObj: any) => {
        req.headers.userid = userObj.userid;
        req.headers.device = userObj.device;
        next();
    }).catch((err: any) => {
        return commonUtils.sendError(req, res, {message: err}, 401);
    })
}

async function verifyRefreshToken(req: any, res: Response, next: Function) {
    let tokens_ = req.headers?.authorization?.split(' ') ?? []

     if (tokens_.length > 1) {
        const token = tokens_[1];

        if (token === null) return commonUtils.sendError(req, res, {message: AppStrings.INVALID_REQUEST}, 401);

        jwt.verify(token, config.get("JWT_REFRESH_SECRET"), async (err: any, user: any) => {
            if (err) {
                if (err.name == "TokenExpiredError") {
                    return commonUtils.sendError(req, res, {message: AppStrings.INVALID_SESSION}, 401)
                } else {
                    return commonUtils.sendError(req, res, {message: AppStrings.INVALID_SESSION}, 401)
                }
            } else {
                let midLayer = aes.decrypt(user.sub, config.get("OUTER_KEY_PAYLOAD"))
                const userData =  JSON.parse(aes.decrypt(midLayer, config.get("OUTER_KEY_USER")))
                req.userData = userData
                req.midLayer = midLayer
                req.token = token

                if (userData?.device !== 3) {
                    let oldValue = await redisClient.get("m_"+midLayer.toString())
                    let token_

                    if (oldValue) {
                        token_ = JSON.parse(oldValue)?.refreshToken == token
                    }

                    if (token_) {
                        return next();
                    } else {
                        return commonUtils.sendError(req, res, {message: AppStrings.UNAUTHORIZED}, 401);
                    }

                } else {
                    let tokens: [] = await redisClient.lrange("w_"+midLayer, 0, -1)
                    let token_ = tokens.find(value => JSON.parse(value).refreshToken.toString() == token.toString())

                    if (token_) {
                        return next();
                    } else {
                        return commonUtils.sendError(req, res, {message: AppStrings.UNAUTHORIZED}, 401);
                    }
                }
            }
        })
    } else {
        return commonUtils.sendError(req, res, {message: AppStrings.UNAUTHORIZED}, 401);
    }
}

async function isAdmin(req: any, res: Response, next: NextFunction) {
    const user_id = req.headers.userid;  
    if (!user_id)
      return next();
  
    const admin = await Admin.findById(user_id);
    if (!admin)
      return commonUtils.sendError(req, res, { message: AppStrings.ADMIN_NOT_FOUND }, 404);
  
    if (admin.isActive !== true)
      return commonUtils.sendError(req, res, { message: AppStrings.NOT_AUTHORIZED }, 401);
    
    req.headers.adminrole = admin.adminrole
    
    next();
  }

export default {
    verifyToken,
    verifyRefreshToken,
    isAdmin
}