const config = require("config")

export const AppConstants = {
    "API_ROUTE_SOCKET": "",
    "IMAGE_PATH": config.get("ROUTE_URL") + "/uploads/images/",
    "AUDIO_PATH": config.get("ROUTE_URL") + "/uploads/audio/",
    "VIDEO_PATH": config.get("ROUTE_URL") + "/uploads/video/",


    "MODEL_USER": 'User',
    "MODEL_BUSINESS": 'Business',
    "MODEL_ADDRESS":'Address',
    "MODEL_FRIENDS": 'Friends',
    "MODEL_TRUST": 'Trust',
    "MODEL_ENDORSED": 'endorsed',
    "MODEL_ADMIN": 'Admin',
    "MODEL_TOKEN": 'Token',
    "MODEL_JOBS_CATEGORY": 'JobsCategory',
    "MODEL_JOBS": 'Jobs',
    "MODEL_RATING": 'Rating',
    "MODEL_APPLY": 'JobsApply',
    "MODEL_JOB_MANAGEMENT": 'JobsManagement',
    "MODEL_DISPUTE": 'Dispute',
    "MODEL_WALLET": 'Wallet',
    "MODEL_PAYMENTS": 'Payments',
    "MODEL_WALLET_TRANSACTION": 'WalletTransaction',
    "MODEL_CHAT": 'Chat',
    "MODEL_CONVERSATION": 'ChatConversation',
    "MODEL_REFERAL": 'Referal',
    "MODEL_INDUSTRY": 'Industry',
    "MODEL_JOB_CANCEL": 'Reason',
    "MODEL_TRANSACTION": 'Transaction',
    "MODEL_CONTACT": 'Contact',
    "MODEL_POLICY": 'Policy',
    "MODEL_USER_PROFILE": 'userProfile',
    "MODEL_LOCATION_TRACE": 'locationTrace',
    "GIVEN": 'given',
    "RECEIVED": 'received',

    "JOB_ID": 'job_id',

    "TOKEN_EXPIRY_TIME": '5m',
    "DATE_FORMAT": "yyyy-MM-DD HH:mm:ss.SSS",
    "DATE_FORMAT_SHORT": "yyyy-MM-DD HH:mm:ss",
    "DISTANCE_LIMIT_IN_METER" : 500

}

declare global {
    interface String {
        isExists(): boolean;

        isEmpty(): boolean;
    }

    interface Number {
        isExists(): boolean;
    }

    interface Boolean {
        isExists(): boolean;
    }
}

String.prototype.isExists = function () {
    return !(typeof (this) == 'undefined' || this == null);
}
String.prototype.isEmpty = function () {
    return (this) == "";
}

Number.prototype.isExists = function () {
    return !(typeof (this) == 'undefined' || this == null);
}

Boolean.prototype.isExists = function () {
    return !(typeof (this) == 'undefined' || this == null);
}