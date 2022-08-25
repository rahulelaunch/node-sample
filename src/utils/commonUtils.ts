import {AppConstants} from "./appConstants";
import moment from "moment";
import express, {NextFunction, Request, Response} from "express";
import encryptedData from "../middlewares/secure/encryptData";
import multer, { FileFilterCallback } from 'multer'
type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void
const path = require('path')
const os = require('os')
const md5 = require("md5");
import decryptedData from "../middlewares/secure/decryptData";
import verifyToken from "../middlewares/validations";
import { MicroComponent } from "./enum";
import BusinessValidation from "../components/business/validation"

const getRootDir = () => path.parse(process.cwd()).root
const getHomeDir = () => os.homedir()
const getPubDir = () => "./public"


function formatDate(date: any) {
    return moment(date).format(AppConstants.DATE_FORMAT)
}

async function sendSuccess(req: Request, res: Response, data: any, statusCode = 200) {
    if (req.headers.env === "test") {
        return res.status(statusCode).send(data)
    }

    let encData = await encryptedData.EncryptedData(req, res, data)
    return res.status(statusCode).send(encData)
}

async function sendAdminSuccess(req: Request, res: Response, data: any, statusCode= 200) {
    return res.status(statusCode).send(data)
}
async function sendAdminError(req: Request, res: Response, data: any, statusCode= 422) {
    return res.status(statusCode).send(data)
}

async function sendError(req: Request, res: Response, data: any, statusCode = 422) {
    if (req.headers.env === "test") {
        return res.status(statusCode).send(data)
    }
    
    // let encData = await encryptedData.EncryptedData(req, res, data)
    return res.status(statusCode).send(data)
}

function getCurrentUTC(format = AppConstants.DATE_FORMAT, addMonth: any = null, addSeconds: number = 0) {
    // console.log(moment.utc(new Date()).format("YYYY-MM-DD HH:mm:ss"));
    if (addMonth != null) {
        return moment.utc(new Date()).add(addMonth, 'M').format(format);
    } else if (addSeconds > 0) {
        return moment.utc(new Date()).add(addSeconds, 'seconds').format(format);
    } else {
        return moment.utc(new Date()).add().format(format);
    }
}

function formattedErrors(err: any) {
    let transformed: any = {};
    Object.keys(err).forEach(function (key, val) {
        transformed[key] = err[key][0];
    })
    return transformed
}

export const fileStorage = multer.diskStorage({
    destination: (request: Request,file: Express.Multer.File,callback: DestinationCallback): void => {        
        callback(null, './src/uploads/images')
    },

    filename: (req: Request, file: Express.Multer.File, callback: FileNameCallback): void => {
        callback(null, md5(file.originalname) + '-' + Date.now() + path.extname(file.originalname))
    }
})

export const fileStoragePdf = multer.diskStorage({
    destination: (request: Request,file: Express.Multer.File,callback: DestinationCallback): void => {
        callback(null, './src/uploads/files')
    },

    filename: (req: Request, file: Express.Multer.File, callback: FileNameCallback): void => {
        callback(null, md5(file.originalname) + '-' + Date.now() + path.extname(file.originalname))
    }
})

export const fileFilterPdf = (request: Request,file: Express.Multer.File,callback: FileFilterCallback): void => {
    if (
        file.mimetype === 'application/pdf'||
        file.mimetype === 'application/msword'||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

export const fileStorageAudio = multer.diskStorage({
    destination: (request: Request,file: Express.Multer.File,callback: DestinationCallback): void => {        
        callback(null, './src/uploads/audio')
    },

    filename: (req: Request, file: Express.Multer.File, callback: FileNameCallback): void => {
        callback(null, md5(file.originalname) + '-' + Date.now() + path.extname(file.originalname))
    }
})

export const fileStorageVideo = multer.diskStorage({
    destination: (request: Request,file: Express.Multer.File,callback: DestinationCallback): void => {
        callback(null, './src/uploads/video')
    },

    filename: (req: Request, file: Express.Multer.File, callback: FileNameCallback): void => {
        callback(null, md5(file.originalname) + '-' + Date.now() + path.extname(file.originalname))
    }
})

export const fileFilter = (request: Request,file: Express.Multer.File,callback: FileFilterCallback): void => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}
export const fileFilterAudio = (request: Request,file: Express.Multer.File,callback: FileFilterCallback): void => {    
    if (
        file.mimetype === 'audio/mpeg' ||
        file.mimetype === 'audio/mp3' ||
        file.mimetype === 'audio/mp4' ||
        file.mimetype === 'audio/wav'
    ) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

export const fileFilterVideo = (request: Request,file: Express.Multer.File,callback: FileFilterCallback): void => {
    if (
        file.mimetype === 'video/mpg' ||
        file.mimetype === 'video/mp4' ||
        file.mimetype === 'video/m4v' ||
        file.mimetype === 'video/mkv' ||
        file.mimetype === 'video/webm' ||
        file.mimetype === 'video/avi'
    ) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

const uploadImage = (req: Request, res: Response, next: NextFunction) => {
    const upload = multer({
        storage: fileStorage,
        fileFilter: fileFilter
    }).single('image')

    upload(req, res, (err: any) => {
        if (err) {
            return sendError(req, res, err)
        }
        next()
    })
}


const routeArray = (array_:any, prefix:any, isAdmin:Boolean = false,component:MicroComponent=0) => {
    // path: "", method: "post", controller: "",validation: ""(can be array of validation), 
    // isEncrypt: boolean (default true), isPublic: boolean (default false)

   array_.forEach((route:any) => {
        const method = route.method as "get" | "post" | "put" | "delete" | "patch";
        const path = route.path;
        const controller = route.controller;
        const validation = route.validation;
        let middlewares = [];
        const isEncrypt = route.isEncrypt === undefined ? true : route.isEncrypt;
        const isPublic = route.isPublic === undefined ? false : route.isPublic;
        const skipComponentId = route.skipComponentId === undefined ? false : route.skipComponentId;
        if (isEncrypt && !isAdmin) {
            middlewares.push(decryptedData.DecryptedData);
        }
        if (!isPublic) {
            middlewares.push(verifyToken.verifyToken);
        }
        if(isAdmin){
            middlewares.push(verifyToken.isAdmin);
        }
        if(component && !skipComponentId){
            switch (component) {
                case MicroComponent.BUSINESS:                    
                    middlewares.push(BusinessValidation.hasBusinessValidation)
                    break;
                default:
                    break;
            }
        }
        if (validation) {
            if(Array.isArray(validation)) {
                middlewares.push(...validation);
            } else {
                middlewares.push(validation);
            }
        }
        middlewares.push(controller);
        prefix[method](path,...middlewares);
    })
    
    return prefix;
}
export default  {
    getCurrentUTC,
    sendSuccess,
    sendError,
    formattedErrors,
    getRootDir,
    getHomeDir,
    getPubDir,
    formatDate,
    uploadImage,
    routeArray,
    sendAdminSuccess,
    sendAdminError,
}
