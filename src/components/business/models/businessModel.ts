import mongoose from "mongoose";
import {AppConstants} from "../../../utils/appConstants";
import {Device, Recognise, TrustStatus} from "../../../utils/enum"

const trustStatus = Object.values(TrustStatus).filter(value => typeof value === 'number');
const deviceType = Object.values(Device).filter(value => typeof value === 'number');
const recognise = Object.values(Recognise).filter(value => typeof value === 'number');

const addressSchema = new mongoose.Schema({
    name: String,
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number]
        },
    },
}, {_id: false})

const contactSchema = new mongoose.Schema({
    name: String,
    image: String,
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AppConstants.MODEL_USER
    }
}, {_id: false})

const permissionSchema = new mongoose.Schema({
    location: {
        whileUsingApp: Boolean,
        withLinkedContact: Boolean,
        withPublic: Boolean,
        notShared : Boolean
    },
    visibility: {
        picture: Boolean,
        status: Boolean,
        post: Boolean,
    },
    acceptMessage: {
        public: Boolean,
        contact: Boolean,
        marketing: Boolean,
    },
}, {_id: false})

const reference = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AppConstants.MODEL_USER
    },
    isEndorsed: {
        type: Number,
        enum: recognise
    } // 0 and 1
}, {_id: false})

const advertisementSchema = new mongoose.Schema({
    message: String,
    video: String,
    image: String,
    audio: String
}, {_id: false})

const businessSchema = new mongoose.Schema({
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: AppConstants.MODEL_USER
        },
        name: String,
        image: String,
        businessCategory:{
          type: mongoose.Schema.Types.ObjectId,
        },
        mobile: {
            type: String,
            require: false,
        },
        email:String,
        address:addressSchema,
        bio:String,
        businessStatus:String,
        optionalMobile: {
            secondary: String,
            alternative: String
        },
        document: {
            registrationNumber: String,
            image:String,
            secondaryNumber:String,
            address:addressSchema,
            idVerifyByAdmin: Boolean, //admin update
            imageVerifyByAdmin: Boolean, //admin update
        },
        permissions: permissionSchema,
        reference: [reference],
        advertisement:advertisementSchema,
        averageRating: {
            stars: {
                type: Number,
                default: 0,
            },
            commentCount: {
                type: Number,
                default: 0,
            },
        },
        trustLevel: {
            image: {type: Number, enum: trustStatus, default: TrustStatus.PENDING},
            id: {type: Number, enum: trustStatus, default: TrustStatus.PENDING},
            reference: {type: Number, enum: trustStatus, default: TrustStatus.PENDING},
            address: {type: Number, enum: trustStatus, default: TrustStatus.PENDING}
        },
        isProfileComplete: {
            type: Number,
            default: 0,
            required: false,
        },
    },
    {timestamps: true}
);

businessSchema.index({
    "address.location": "2dsphere",
    "document.homeAddress.location": "2dsphere"
})

module.exports = mongoose.model(AppConstants.MODEL_BUSINESS, businessSchema);