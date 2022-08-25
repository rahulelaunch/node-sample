import auth from "../../auth";
import authController from "./controller/authController";
import V from "./validation";
// path: "", method: "post", controller: "",
// validation: ""(can be array of validation), 
// isEncrypt: boolean (default true), isPublic: boolean (default false)

export default [
    {
        path: "/register",
        method: "post",
        controller: authController.adminRegister,
        validation: [V.adminregisterValidation],
        isPublic: true
    },
    {
        path: "/admin/update",
        method: "put",
        controller: authController.adminUpdate,
        validation: [V.adminUpdateValidation],        
    },
    {
        path: "/admin/:id",
        method: "delete",
        controller: authController.adminDelete,
        validation: [V.isSuperAdmin],        
    },
    {
        path: "/upload/image",
        method: "post",
        controller: authController.uploadImage,
        isPublic: true
    },
    {
        path: "/login/access",
        method: "post",
        controller: authController.loginAccess,
        validation: [V.isSuperAdmin, V.loginAccessValidation],
    },
    {
        path: "/login",
        method: "post",
        controller: authController.login,
        validation: V.loginValidation,
        isPublic: true
    },
    {
        path: "/password/change",
        method: "put",
        controller: authController.changePassword,
        validation: V.changePasswordValidation,
    },
    {
        path: "/admin",
        method: "get",
        controller: authController.adminList,
        validation: V.isSuperAdmin,
    },
    {
        path: "/logout",
        method: "patch",
        controller: auth.logout,
        isEncrypt: false,
        isPublic: true
    },
    {
        path: "/profile",
        method: "get",
        controller: authController.getProfile,
    },
    {
        path: "/refreshToken",
        method: "get",
        controller: auth.getAdminRefreshToken,
        isPublic: true
    },
    {
        path: "/role/assign",
        method: "post",
        controller: authController.assignRole,
    },
    
];