import {EventEmitter} from 'events';
import Mail from '../../src/components/email';
import Phone from '../../src/components/phone';
// import trustController from "../../src/components/trust/trustController"

const eventEmitter = new EventEmitter();

// const LocationTrace = require("../components/users/models/locationTrace")

// eventEmitter.on('send_email', (data: any) => {
//     Mail.sendMailOTP(data.to, data.subject, data.data.message, data.data.otp);
// });

eventEmitter.on('send_email_otp', (data: any) => {
    Mail.sendMailOTP(data.to, data.subject, data.data.message, data.data.otp);
});

eventEmitter.on('send_phone_otp', (data: any) => {
    Phone.sendPhoneOTP(data.to);
});

//TODO: when new user register check for their email or mobile match and send them endorsed notification
// eventEmitter.on('user.checkForSelfEndorsed', (data: any) => trustController.checkForSelfEndorsed(data));
// eventEmitter.on('user.checkOnReferencesEndorsed', (data: any) => trustController.checkOnreferencesEndorsed(data));


/**
 *   @description Add Location Trace
 *   @param userId & Address
 * */
// eventEmitter.on('addLocationTrace', async (data: any) => {

//     // TODO:: add location trace entry

//     console.log("addLocationTrace: ", data)

//     const location = {
//         type: "Point",
//         coordinates: [data.address.longitude, data.address.latitude],
//     }
//     /**
//      *  Add Location Trace for user
//      * */
//     let locationTrace = new LocationTrace()
//     locationTrace.user_id = data.userId
//     locationTrace.location = location
//     locationTrace.distance = data.distance
//     locationTrace.result = data.result
//     await locationTrace.save()

// })

export default eventEmitter;
