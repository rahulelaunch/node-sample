import mongoose from "mongoose";
import { AppConstants } from "../../../utils/appConstants";

const mongoose_ = require('mongoose');

const adminSchema = new mongoose_.Schema({
    username: {
        type: String,
        require: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    mobile: {
        type: String,
        require: false,
        default: null,
    },
    about: {
        type: String,
    },
    image: {
        type: String,
        require: false,
        default: null,
    },
    password: {
        type: String,
        require: true
    },
    adminrole: {
        type: Number,
    },
    isActive: {
        type: Boolean,
    },
}, { timestamps: true });

module.exports = mongoose_.model(AppConstants.MODEL_ADMIN, adminSchema);