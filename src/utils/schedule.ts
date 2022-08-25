import {Agenda} from 'agenda';
import { myTrustLevel, trustLevelStars} from "./trustLevelUtils";
import {TrustStatus} from "./enum";

const config = require("config");

const agenda = new Agenda({db: {address: config.get("DB_CONN_STRING"), collection: 'verifyLocationSchedule'}});
const User = require("../components/users/models/userModel")
// const LocationTraces = require("../components/users/models/locationTrace")
//agenda define here

/**
 *  Verify Home address & Set trust level status for home address
 * */
agenda.define("evaluateHomeAddressVerification", async (args: any) => {

    const data = args.attrs.data
    let user = await User.findOne({
        _id: data.userId
    }).select("trustLevel address").lean()
    console.log("AVUUUUU AVUUUU", user)

    // if (user) {
    //     console.log("USER_TRUST_LEVEL: ", user)

    //     // let locationTraces = await LocationTraces.find(
    //     //     {
    //     //         user_id: data.userId,
    //     //     }
    //     // ).lean()

    //     console.log("LOCATION_TRACES: ", locationTraces)

    //     let successTraces = locationTraces.filter((doc: any) => doc.result).length

    //     console.log("LOCATION_TRACES_AVERAGE: ", successTraces, locationTraces.length, (successTraces / locationTraces.length) * 100)


    //     user.trustLevel = {
    //         image: user.trustLevel.image,
    //         id: user.trustLevel.id,
    //         reference: user.trustLevel.reference,
    //         address: ((successTraces / locationTraces.length) * 100) > 30 ? TrustStatus.ACCEPT : TrustStatus.INVALID,
    //     }

    //     await user.save()

    //     /**
    //      *   GET trust level constant
    //      * */
    //     const myTrustConstant: number = myTrustLevel(
    //         user.trustLevel?.image?.valueOf() ?? 1,
    //         user.trustLevel?.id?.valueOf() ?? 1,
    //         user.trustLevel?.reference?.valueOf() ?? 1,
    //         user.trustLevel?.address?.valueOf() ?? 1,
    //     )

    //     /**
    //      *  Evaluate Trust Level using constant
    //      * */
    //     const trustLevel = trustLevelStars(myTrustConstant)
    //     console.log("MY_TRUST_CODE: ", myTrustConstant)
    //     console.log("MY_TRUST_LEVEL: ", trustLevel)

    //     if (args.key === 72) {
    //         await agenda.start()
    //         await agenda.schedule("in 18 days", "evaluateHomeAddressVerification", {
    //             "userId": args.userId,
    //             "key": 21
    //         })
    //     }
    // }

})

export default agenda;