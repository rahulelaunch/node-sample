import UserController from "./userController";
import V from "./validation";

// path: "", method: "post", controller: "",
// validation: ""(can be array of validation),
// isEncrypt: boolean (default true), isPublic: boolean (default false)

export default [
  {
    path: "/upload/image",
    method: "post",
    controller: UserController.uploadImage,
    isEncrypt: false,
  },
  {
    path: "/upload/file",
    method: "post",
    controller: UserController.uploadFile,
    isEncrypt: false,
  },
  {
    path: "/profile",
    method: "get",
    controller: UserController.getProfile,
    validation: V.hasUserValidation,
  },
  {
    path: "/profile",
    method: "post",
    controller: UserController.profileCompleted,
    validation: V.complateProfileValidation,
  },
  {
    path: "/location",
    method: "get",
    controller: UserController.listOfUserLocation,
  },
  {
    path: "/username",
    method: "get",
    controller: UserController.checkUserNameAvailability,
    validation: [V.hasUserValidation],
  },
];
