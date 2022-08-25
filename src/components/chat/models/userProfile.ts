import mongoose from "mongoose";
import { AppConstants } from "../../../utils/appConstants";

const userProfileSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        min: 3,
    },
    image:{
        type: String,
        required: true,
    },
    usertype: {
        type: Number,
        require: true,
        immutable: true
    },
}, { timestamps: true });

module.exports = mongoose.model(AppConstants.MODEL_USER_PROFILE, userProfileSchema);