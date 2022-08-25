import mongoose from "mongoose";
import {AppConstants} from "../../../utils/appConstants";
import {Device} from "../../../utils/enum";

const deviceType = Object.values(Device).filter(value => typeof value === 'number');

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


const userSchema = new mongoose.Schema({
        userName: {
            type: String,
            require: true,
            min: 6,
            max: 255,
        },
        fullName: String,
        bio: String,
        mobile: {
            type: String,
            require: false,
        },
        optionalMobile: {
            secondary: String,
            alternative: String
        },
        document:{
            type: String,
        },
        userStatus: {
            type: String,
        },
        email: {
            type: String,
            require: false,
            unique: false,
            lowercase: true,
            trim: true,
        },
        image: {
            profilePic: String,
            userImage: String,
        },
        address: addressSchema,
        password: {
            type: String,
            require: true,
        },
        device: {
            type: Number,
            enum: deviceType,
            pushToken: {
                type: String,
                require: false,
            },
        },
        isVerify: {
            type: Number,
            require: false,
            default: 0,
        },
        lastLogin: {
            type: Date,
            default: Date.now,
        },
    },
    {timestamps: true}
);

userSchema.index({
    "address.location": "2dsphere",
    "document.homeAddress.location": "2dsphere"
})

module.exports = mongoose.model(AppConstants.MODEL_USER, userSchema);