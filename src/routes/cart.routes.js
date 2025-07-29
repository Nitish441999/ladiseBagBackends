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
router.route("/").get(getCart);
router.route("/:id").delete(deleteCart);
export default router;
