import { AppStrings } from "../../utils/appStrings";

import { NextFunction, Request, Response } from "express";
import commonUtils, { fileFilter, fileFilterAudio, fileStorage, fileStorageAudio } from "../../utils/commonUtils";

const getSeekers = async (req: Request, res: Response, next: NextFunction) => {
    return commonUtils.sendSuccess(req, res, {}, 200);
}

export default {
    getSeekers,
}