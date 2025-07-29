import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();





router.route("/").get(getAllProducts);
router.route("/:id").get(getProductById)
router.use(verifyJWT);
router.route("/").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },    // Main image
    { name: "images", maxCount: 5 },    // Gallery images
  ]),
  createProduct
);

router
  .route("/:id")
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
