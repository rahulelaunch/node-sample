import BusinessController from "./businessController";
import V from "./validation";
import UserController from "../users/userController";

// path: "", method: "post", controller: "",
// validation: ""(can be array of validation),
// isEncrypt: boolean (default true), isPublic: boolean (default false)
// skipComponentId: boolean (default false)

export default [
  {
    path: "/address",
    method: "post",
    controller: BusinessController.addAddress,
    skipComponentId:true,
  },
  {
    path: "/create",
    method: "post",
    controller: BusinessController.createBusiness,
    skipComponentId:true,
    validation: [V.createBusinessValidation],
  },
  {
    path: "/upload/image",
    method: "post",
    controller: BusinessController.uploadImage,
    isEncrypt: false,
    skipComponentId:true,
  },
  {
    path: "/verify/document",
    method: "post",
    controller: BusinessController.verifyDocument,
    validation: [V.verifyDocumentValidation],
  },
  {
    path: "/setting",
    method: "post",
    controller: BusinessController.permissionSetting,
    validation: [V.settingValidation],
  },
  {
    path: "/advertisement",
    method: "post",
    controller: BusinessController.advertisement,
    validation: [V.advertisementValidation],
  },
  {
    path: "/upload/audio",
    method: "post",
    controller: BusinessController.uploadAudio,
    isEncrypt: false,
    skipComponentId:true,
  },
  {
    path: "/upload/video",
    method: "post",
    controller: BusinessController.uploadVideo,
    isEncrypt: false,
    skipComponentId:true,
  },
  {
    path: "/references",
    method: "post",
    controller: BusinessController.submitReferences,
  },
];