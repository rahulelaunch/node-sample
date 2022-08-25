import {AppStrings} from "../../utils/appStrings";

const Business = require('./models/businessModel');
const Address = require('./models/addressModel');
import {NextFunction, Request, Response} from "express";
import commonUtils, {
    fileFilter,
    fileFilterAudio, fileFilterVideo,
    fileStorage,
    fileStorageAudio,
    fileStorageVideo
} from "../../utils/commonUtils";
import {Recognise, TrustStatus, UserData} from "../../utils/enum";
import mongoose from "mongoose";
import eventEmitter from "../../utils/event";

const multer = require("multer");
const User = require('../users/models/userModel');

async function addAddress(req: any, res: Response) {
    let businessId = req.headers.businessid;
    console.log(businessId)

    const address = new Address({
        userId: req.headers.userid,
        businessId: businessId,
        businessName: req.body.businessName,
        businessLocationName: req.body.businessLocationName,
        physicalAddress: req.body.physicalAddress,
        location: {
            type: "Point",
            coordinates: [req.body?.longitude, req.body?.latitude]
        },
        description: req.body.description,
        email: req.body.email,
        mobile: req.body.mobile
    });

    console.log(address)
    await address.save();

    return commonUtils.sendSuccess(req, res, address);

}

const uploadImage = async (req: Request, res: Response) => {

    const image_ = multer({
        storage: fileStorage,
        fileFilter: fileFilter,
    }).single("image");

    image_(req, res, async (err: any) => {
        if (err) return commonUtils.sendError(req, res, {message: AppStrings.IMAGE_NOT_UPLOADED}, 409);
        if (!req.file) return commonUtils.sendError(req, res, {message: AppStrings.IMAGE_NOT_FOUND}, 409);
        const image = req.file.filename;
        return commonUtils.sendSuccess(req, res, {
            image: image,
        }, 200);
    });
}

async function createBusiness(req: any, res: Response) {
    const user_id = req.headers.userid;
    const user = await User.findById(user_id);
    if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_NOT_FOUND}, 409);

    try {
        const business = new Business({
            name: req.body.name,
            image: req.body.image,
            businessCategory: req.body.categoryId ?? null,
            mobile: req.body.mobile,
            email: req.body.email,
            address: {
                name: req.body.name,
                location: {
                    type: "Point",
                    coordinates: [req.body.address.longitude, req.body.address.latitude]
                },
            },
            bio: req.body.bio,
            businessStatus: req.body.businessStatus,
            optionalMobile: {
                secondary: req.body.optionalMobile?.secondary || "",
                alternative: req.body.optionalMobile?.alternative || "",
            }
        })

        await business.save();

        let business_ = await Business.findById({_id: business._id})

        return commonUtils.sendSuccess(req, res, {"_id": business_._id});

    } catch (e) {
        console.log(e)
        return commonUtils.sendError(req, res, {message: AppStrings.SOMETHING_WENT_WRONG});
    }
}

async function verifyDocument(req: any, res: Response) {
    const businessId = req.headers.businessid as string;
    const business = await Business.findOne({_id: new mongoose.Types.ObjectId(businessId)}).exec();
    if (!business) return commonUtils.sendError(req, res, {message: AppStrings.BUSINESS_NOT_FOUND}, 409);
    try {
        business.document = {
            registrationNumber: req.body.registrationNumber,
            image: req.body.image,
            secondaryNumber: req.body.secondaryNumber,
            address: {
                name: req.body?.address.name,
                location: {
                    type: "Point",
                    coordinates: [req.body?.address.longitude, req.body?.address.latitude]
                },
            }
        }
        // user.trustLevel.id = TrustStatus.ACCEPT // FOR TEST PURPOSE
        await business.save();

        let business_ = await Business.findById({_id: business._id})

        return commonUtils.sendSuccess(req, res, {"_id": business_._id});

    } catch (e) {
        console.log(e)
    }
}

async function permissionSetting(req: any, res: Response) {
    const businessId = req.headers.businessid as string;
    const business = await Business.findOne({_id: new mongoose.Types.ObjectId(businessId)}).exec();
    if (!business) return commonUtils.sendError(req, res, {message: AppStrings.BUSINESS_NOT_FOUND}, 409);

    try {
        const setting = {
            permissions: {
                location: {
                    whileUsingApp: req.body.location.whileUsingApp,
                    withLinkedContact: req.body.location.withLinkedContact,
                    withPublic: req.body.location.withPublic,
                    notShared: req.body.location.notShared,
                },
                visibility: {
                    picture: req.body.visibility.picture,
                    status: req.body.visibility.status,
                    post: req.body.visibility.post,
                },
                acceptMessage: {
                    public: req.body.acceptMessage.public,
                    contact: req.body.acceptMessage.contact,
                    marketing: req.body.acceptMessage.marketing,
                },
            },
        }

        business.permissions = setting.permissions;
        await business.save();

        let business_ = await Business.findById({_id: business._id})
        return commonUtils.sendSuccess(req, res, {"_id": business_._id});

    } catch (e) {
        console.log(e);
    }
}

async function advertisement(req: any, res: Response) {
    const businessId = req.headers.businessid as string;
    const business = await Business.findOne({_id: new mongoose.Types.ObjectId(businessId)}).exec();
    if (!business) return commonUtils.sendError(req, res, {message: AppStrings.BUSINESS_NOT_FOUND}, 409);

    try {
        business.advertisement = {
            message: req.body.message,
            video: req.body.video,
            image: req.body.image,
            audio: req.body.audio
        }

        await business.save();
        let business_ = await Business.findById({_id: business._id})
        return commonUtils.sendSuccess(req, res, {"_id": business_._id});
    } catch (e) {
        console.log(e)
    }
}

async function submitReferences(req: any, res: Response) {
    const businessId = req.headers.businessid as string;
    let reference: any = [];
    const refs = req.body;

    const business = await Business.findOne({_id: new mongoose.Types.ObjectId(businessId)}).exec();

    if (!business) return commonUtils.sendError(req, res, {message: AppStrings.BUSINESS_NOT_FOUND}, 409);

    if (!Array.isArray(refs) && !refs.length) {
        return commonUtils.sendError(req,res,{error:AppStrings.INVALID_DATA})
    }

    await Promise.all(refs.map(async (element: any) => {
        const checkUser = await Business.findOne({
            $or: [
                {email: element.email},
                {mobile: element.mobile},
                {"optionalMobile.secondary": element.mobile},
                {"optionalMobile.alternative": element.mobile},
            ],
        }).select("_id");

        const ref: any = {
            name: element?.name,
            email: element?.email,
            mobile: element?.mobile,
            isEndorsed: Recognise.PENDING
        }
        if (checkUser) ref.id = checkUser._id
        reference.push(ref)
    }))

    business.reference = reference
    // Business.trustLevel.reference = TrustStatus.ACCEPT // FOR TEST PURPOSE
    // eventEmitter.emit('user.checkOnReferencesEndorsed', {userId: Business._id})
    await business.save()
    let business_ = await Business.findById({_id: business._id})
    return commonUtils.sendSuccess(req, res, {"_id": business_._id});
}

async function uploadAudio(req: any, res: Response) {
    const audio = multer({
        storage: fileStorageAudio,
        fileFilter: fileFilterAudio,
    }).single("audio");

    audio(req, res, async (err: any) => {
        if (err) {
            return commonUtils.sendError(req, res, {message: AppStrings.AUDIO_NOT_UPLOADED}, 409);
        }
        if (!req.file) return commonUtils.sendError(req, res, {message: AppStrings.AUDIO_NOT_FOUND}, 404);
        const image_name = req.file.filename;
        return commonUtils.sendSuccess(req, res, {
            audio: image_name
        }, 200);
    });
}

async function uploadVideo(req: any, res: Response) {
    const video = multer({
        storage: fileStorageVideo,
        fileFilter: fileFilterVideo,
    }).single("video");

    video(req, res, async (err: any) => {
        if (err) {
            return commonUtils.sendError(req, res, {message: AppStrings.VIDEO_NOT_UPLOADED}, 409);
        }
        if (!req.file) return commonUtils.sendError(req, res, {message: AppStrings.VIDEO_NOT_FOUND}, 404);
        const image_name = req.file.filename;
        return commonUtils.sendSuccess(req, res, {
            video: image_name
        }, 200);
    });
}

async function methodAllowance(req: any, res: Response) {
    return commonUtils.sendError(req, res, {message: "Request method now allowed."}, 405);
}

export default {
    addAddress,
    createBusiness,
    uploadImage,
    verifyDocument,
    permissionSetting,
    advertisement,
    submitReferences,
    uploadAudio,
    uploadVideo,
    methodAllowance
}