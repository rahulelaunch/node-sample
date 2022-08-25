import auth from "../../auth";
import authController from "./authController";
import validations from "./validation";
import V from "./validation";
import encryptedData from "../../middlewares/secure/encryptData";
import decryptData from "../../middlewares/secure/decryptData";

// path: "", method: "post", controller: "",
// validation: ""(can be array of validation), 
// isEncrypt: boolean (default true), isPublic: boolean (default false)

export default [
   // user Auth
    {
        path: "/register",
        method: "post",
        controller: authController.register,
        validation: V.registerValidation,
        isPublic: true,
    },
    {
        path: "/login",
        method: "post",
        controller: authController.login,
        validation: V.loginValidation,
        isPublic: true,
    },
    {
        path: "/logout",
        method: "patch",
        controller: auth.logout,
        isEncrypt: false,
    },
    {
        path: "/user/validation",
        method: "post",
        controller: authController.checkUnique,
        validation: V.userValidation,
        isPublic: true,
    },
    {
        path: "/refreshToken",
        method: "get",
        controller: auth.getAccessToken,
        isPublic: true,
    },
    {
        path: "/web/refreshToken",
        method: "get",
        controller: auth.getWebRefreshToken,
        isPublic: true,
    },
    {
        path: "/otp/get",
        method: "post",
        controller: authController.getOTP,
        validation: V.OTPValidation,
        isPublic: true,
    },
    {
        path: "/otp/resend",
        method: "post",
        controller: authController.resendOTP,
        validation: V.OTPValidation,
        isPublic: true,
    },
    {
        path: "/password/forgot",
        method: "post",
        controller: authController.forgotPassword,
        validation: [validations.tokenValidation, validations.forgotPasswordValidation],
        isPublic: true,
    },
    {
        path: "/otp/verify/signup",
        method: "post",
        controller: authController.signupVerifyOTP,
        validation: V.verifyOTPValidation,
        isPublic: true,
    },
    {
        path: "/otp/verify",
        method: "post",
        controller: authController.verifyOTP,
        validation: V.verifyOTPValidation,
        isPublic: true,
    },
    {
        path: "/password/change",
        method: "post",
        controller: authController.changePassword,
        validation: V.changePasswordValidation,
    },
    //test
    {
        path: "/encryption",
        method: "post",
        controller: encryptedData.encryptedDataRequest,
        isEncrypt: false,
        isPublic: true,
    },
    {
        path: "/decryption",
        method: "post",
        controller:  decryptData.DecryptedDataRequest,
        isEncrypt: false,
        isPublic: true,
    }
];
