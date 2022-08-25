import UserController from "./chatController";
import V from "./validation";

// path: "", method: "post", controller: "",
// validation: ""(can be array of validation), 
// isEncrypt: boolean (default true), isPublic: boolean (default false)

export default [
    //seeker
    {
        path: "/seekers",
        method: "get",
        controller: UserController.getSeekers,
        validation: null,
    },
];