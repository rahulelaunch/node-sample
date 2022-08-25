import mongoose from "mongoose";
import {AppConstants} from "../../../utils/appConstants";

const addressSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
    },
    businessId:{
        type: mongoose.Schema.Types.ObjectId,
    },
    businessName:String,
    businessLocationName:String,
    physicalAddress:String,
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number]
        },
    },
    description:String,
    email:String,
    mobile:String
}, {timestamps: true})

addressSchema.index({
    "location": "2dsphere",
})

module.exports = mongoose.model(AppConstants.MODEL_ADDRESS, addressSchema);