import mongoose from "mongoose";
import { AppConstants } from "../../../utils/appConstants";
import { msgType , MessageStatusEnum} from "../../../utils/enum";
const msgType_ = Object.values(msgType).filter(value => typeof value === 'number');
const MessageStatusEnum_ = Object.values(MessageStatusEnum).filter(value => typeof value === 'number');

const chatSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: AppConstants.MODEL_USER
    },
    disputeId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: AppConstants.MODEL_DISPUTE
    },
    recieverId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: AppConstants.MODEL_USER
    },
    message: {
        type: String,
        required: true
    },
    msgType: {
        type: Number,
        enum: msgType_,
        required: true
    },
    readStatus: {
        type: Number,
        required: true,
        enum: MessageStatusEnum_
    },
    deletedStatus: {
        type: Number,
        required: true,
        default: false
    },
}, { timestamps: true });

module.exports = mongoose.model(AppConstants.MODEL_CHAT, chatSchema);