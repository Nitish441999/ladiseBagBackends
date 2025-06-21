import { Router } from "express";
import  verifyJWT  from "../middlewares/auth.middleware.js";
import {
  addToCart,
  deleteCart,
  getCart,
} from "../controllers/cart.controller.js";
const router = Router();
router.use(verifyJWT);
router.route("/").post(addToCart);
router.route("/:userId").get(getCart);
router.route("/:productId").delete(deleteCart);
export default router;
