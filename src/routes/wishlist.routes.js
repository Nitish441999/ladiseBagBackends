import { Router } from "express";
import { addToWishlist } from "../controllers/wishlist.controllers.js";
import verifyJWT from "../middlewares/auth.Middleware.js";
const router = Router()
router.use(verifyJWT)
router.route("/").post(addToWishlist).get()
