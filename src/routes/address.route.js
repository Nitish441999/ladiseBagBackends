import { Router } from "express";

import {
  createAddress,
  deleteAddress,
  getAllAddresses,
  updateAddress,
} from "../controllers/address.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/").post(createAddress);
router.route("/:userId").get(getAllAddresses);
router.route("/:id").delete(deleteAddress).put(updateAddress);
export default router;
