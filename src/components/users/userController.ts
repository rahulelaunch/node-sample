import {AppStrings} from "../../utils/appStrings";

const User = require('./models/userModel');
import {NextFunction, Request, Response} from "express";
import {ImageType, ProviderType, Recognise, TrustStatus, UserData} from "../../utils/enum";
import commonUtils, {
    fileFilter,
    fileFilterAudio,
    fileFilterPdf,
    fileFilterVideo,
    fileStorage,
    fileStorageAudio,
    fileStoragePdf,
    fileStorageVideo
} from "../../utils/commonUtils";
import {AppConstants} from "../../utils/appConstants";

const multer = require("multer");

const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.headers.userid;
    const user = await User.findById(user_id);
    if (!user)
        return commonUtils.sendError(req, res, {message: AppStrings.USER_NOT_FOUND}, 409);

    const image_ = multer({
        storage: fileStorage,
        fileFilter: fileFilter,
    }).single("image");

    image_(req, res, async (err: any) => {
        if (err) return commonUtils.sendError(req, res, {message: AppStrings.IMAGE_NOT_UPLOADED}, 409);
        if (!req.file) return commonUtils.sendError(req, res, {message: AppStrings.IMAGE_NOT_FOUND}, 409);
        const image_name = req.file.filename;

        switch (parseInt(req.body.type)) {
            case ImageType.USER_IMAGE:
                user.image.userImage = image_name
                break;
            case ImageType.PROFILE_PIC:
                user.image.profilePic = image_name
                break;
            default:
                return commonUtils.sendError(req, res, {message: AppStrings.INVALID_LIST_TYPE})
        }
       
        await user.save();

        return commonUtils.sendSuccess(req, res, {
            imageUrl: AppConstants.IMAGE_PATH + image_name,
            imageName: image_name,
            message: AppStrings.IMAGE_UPLOADED
        }, 200);
    });
}

async function getProfile(req: any, res: Response) {
    let user_id = req.headers.userid;
    const user = await User.findById(user_id).exec();
    if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_NOT_FOUND}, 409);
    const common_fileds = {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        mobile: user.mobile,
        profilePic: user.image.profilePic ? AppConstants.IMAGE_PATH + user.image.profilePic : null,
        userImage: user.image.userImage ? AppConstants.IMAGE_PATH + user.image.userImage : null,
        userType: user.userType ?? null,
        isProfileComplete: user.isProfileComplete,
        fullName: user.fullName,
        optionalMobile: user.optionalMobile,
        address: user.address,
        document: user.document,
        bio: user.bio,
        userStatus: user.userStatus,
    };

    return commonUtils.sendSuccess(req, res, {...common_fileds}, 200);
}

async function profileCompleted(req: any, res: Response) {
    const user_id = req.headers.userid;
    const user = await User.findById(user_id);

    if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_NOT_FOUND}, 409);
    try {
        if (req.body.address) {
            user.address = {
                name: req.body?.address.name,
                location: {
                    type: "Point",
                    coordinates: [req.body?.address.longitude, req.body?.address.latitude]
                },
            }
        }
        user.optionalMobile = {
            secondary: req.body.optionalMobile?.secondary || "",
            alternative: req.body.optionalMobile?.alternative || "",
        }

        user.bio = req.body.bio || user.bio;
        user.fullName = req.body.fullName || user.fullName;
        user.userStatus = req.body.userStatus || user.userStatus;
        user.userName = req.body?.userName || user.userName;
        user.document = req.body?.document || user.document

        if (!user.email && req.body?.email) {
            user.email = req.body.email
        }

        if (!user.mobile && req.body?.mobile) {
            user.mobile = req.body.mobile
        }
        await user.save();

        let users = {
            displayName: user.fullName,
            userName: user.userName,
            email: user.email,
            mobile: user.mobile,
            profilePic: user.image.profilePic ?? null
        }

        return commonUtils.sendSuccess(req, res, {users});

    } catch (e) {
        console.log(e)
        return commonUtils.sendError(req, res, {message: AppStrings.SOMETHING_WENT_WRONG});
    }
}

// async function profileSetting(req: any, res: Response) {
//     const user_id = req.headers.userid;
//     const user = await User.findOne({'_id': user_id}).exec();

//     if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_NOT_FOUND}, 409);
//     try {
//         const setting = {
//             permissions: {
//                 location: {
//                     whileUsingApp: req.body.location.whileUsingApp,
//                     withLinkedContact: req.body.location.withLinkedContact,
//                     withPublic: req.body.location.withPublic,
//                     notShared: req.body.location.notShared,
//                 },
//                 visibility: {
//                     picture: req.body.visibility.picture,
//                     status: req.body.visibility.status,
//                     post: req.body.visibility.post,
//                 },
//                 acceptMessage: {
//                     public: req.body.acceptMessage.public,
//                     contact: req.body.acceptMessage.contact,
//                     marketing: req.body.acceptMessage.marketing,
//                 },
//             },
//         }

//         user.permissions = setting.permissions;

//         await user.save();

//         if ((req.body.permissions?.location?.whileUsingApp ?? false) && user.address) {

//             const coordinates = new LatLng()
//             coordinates.latitude = user.address?.location?.coordinates?.[0]
//             coordinates.longitude = user.address?.location?.coordinates?.[1]
//             let distance = computeDistanceBetween(coordinates, coordinates)

//             eventEmitter.emit("addLocationTrace", {
//                 "userId": user_id,
//                 "address": req.body.permissions.location,
//                 "distance": distance,
//                 "result": distance <= AppConstants.DISTANCE_LIMIT_IN_METER
//             })

//             /**
//              * start agenda for 72 hours  => make 1st verification of home address
//              * */
//             await agenda.start()
//             await agenda.schedule("in 72 hours", "evaluateHomeAddressVerification", {
//                 "userId": user_id,
//                 "key": 72
//             })
//         }

//         return commonUtils.sendSuccess(req, res, user, 200);
//     } catch (e) {
//         console.log(e);
//     }
// }

async function uploadFile(req: Request, res: Response) {
    const file = multer({
        storage: fileStoragePdf,
        fileFilter: fileFilterPdf,
    }).single("file");

    file(req, res, async (err: any) => {
        if (err) {
            return commonUtils.sendError(req, res, {message: AppStrings.FILE_NOT_UPLOADED}, 409);
        }
        if (!req.file) return commonUtils.sendError(req, res, {message: AppStrings.FILE_NOT_FOUND}, 404);
        const image_name = req.file.filename;
        return commonUtils.sendSuccess(req, res, {
            file: image_name
        }, 200);
    });
}

// async function submitUserReferences(req: any, res: Response) {
//     const user_id = req.headers.userid;
//     let reference: any = [];
//     const refs = req.body;

//     const user = await User.findById(user_id);
//     if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_NOT_FOUND}, 409);

//     if (!Array.isArray(refs) && !refs.length) {
//         return commonUtils.sendError(req,res,{error:AppStrings.INVALID_DATA})     
//     }

//     await Promise.all(refs.map(async (element: any) => {
//         const checkUser = await User.findOne({
//             $or: [
//                 {email: element.email},
//                 {mobile: element.mobile},
//                 {"optionalMobile.secondary": element.mobile},
//                 {"optionalMobile.alternative": element.mobile},
//             ],
//         }).select("_id");
//         const ref: any = {
//             name: element?.name,
//             email: element?.email,
//             mobile: element?.mobile,
//             isEndorsed: Recognise.PENDING
//         }
//         if (checkUser) ref.id = checkUser._id
//         reference.push(ref)
//     }))
    
//     user.reference = reference
//     user.trustLevel.reference = TrustStatus.ACCEPT // FOR TEST PURPOSE
//     eventEmitter.emit('user.checkOnReferencesEndorsed', {userId: user._id})

//     await user.save()
//     return commonUtils.sendSuccess(req, res, {message: AppStrings.REFERENCES_ADDED_SUCCESSFULLY});
// }

// async function submitUserDocumentId(req: any, res: Response) {
//     const user_id = req.headers.userid;

//     const user = await User.findOne({'_id': user_id}).exec();
//     if (!user) return commonUtils.sendError(req, res, {message: AppStrings.USER_NOT_FOUND}, 409);
//     try {
//         user.document = {
//             idNumber: req.body.idNumber,
//             image: req.body.image,
//             idVerifyImage: req.body.idVerifyImage,
//             secondaryNumber: req.body.secondaryNumber,
//             homeAddress: {
//                 name: req.body?.homeAddress.name,
//                 location: {
//                     type: "Point",
//                     coordinates: [req.body?.homeAddress.longitude, req.body?.homeAddress.latitude]
//                 },
//             }
//         }

//         user.trustLevel.id = TrustStatus.ACCEPT // FOR TEST PURPOSE
//         await user.save();
//         return commonUtils.sendSuccess(req, res, {message: AppStrings.DOCUMENT_SUBMITTED_SUCCESSFULLY}, 200);

//     } catch (e) {
//         console.log(e)
//     }
// }

async function checkUserNameAvailability(req: any, res: Response) {

    let {username} = req.query

    let users = await User.find({
        userName: username
    }).select("_id").lean()

    if (users.length > 0) {
        return commonUtils.sendError(req, res, AppStrings.USERNAME_EXISTS, 409)
    }

    return commonUtils.sendError(req, res, {})

}

async function listOfUserLocation(req: Request, res: Response) {
    const userId = req.headers.userid;

    let lat = parseFloat(req.query.lat as string);
    let long = parseFloat(req.query.long as string);
    const range = parseInt(req.query.range as string) || 1000;

    if (!lat && !long && userId) {
        const {address} = await User.findById(userId)
        if (address.location) {
            [long, lat] = address.location.coordinates
        }
    }

    const pipeline = [
        {$sort: {createdAt: -1}},
        {
            $project: {
                _id: 0,
                'userId': '$_id',
                'address': '$address.name',
                'location': '$address.location',
                'profilePic': {$concat: [AppConstants.IMAGE_PATH, "$image.profilePic"]},
                'name': '$userName',
                'distance': {$round: ["$distance", 2]}
            }
        }
    ]

    if (lat && long && range) {
        const geoNear = {
            near: {
                type: "Point",
                coordinates: [long, lat]
            },
            key: "address.location",
            distanceField: "distance",
            spherical: true,
            distanceMultiplier: 0.000621371,
            maxDistance: range * 1000
        }
        //@ts-ignore
        pipeline.unshift({$geoNear: geoNear});
    }

    const User_ = await User.aggregate(pipeline);
    return commonUtils.sendSuccess(req, res, User_);
}

async function methodAllowance(req: any, res: Response) {
    return commonUtils.sendError(req, res, {message: "Request method now allowed."}, 405);
}

export default {
    uploadImage,
    getProfile,
    // setLocation,
    profileCompleted,
    // profileSetting,
    uploadFile,
    // updateLocationEveryHour,
    // submitUserReferences,
    // submitUserDocumentId,
    checkUserNameAvailability,
    listOfUserLocation,
    methodAllowance,
}

//dummy commit
//dummy commit 2