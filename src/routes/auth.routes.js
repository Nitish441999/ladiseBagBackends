import { Router } from "express";
import {
  createUser,
  userLogin,
  userLogout,
} from "../controllers/auth.controller.js";

import { upload } from "../middlewares/multer.middlewares.js";
import verifyJWT from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  createUser
);

router.route("/login").post(userLogin);

router.use(verifyJWT);

router.route("/logout").post(userLogout);

export default router;
