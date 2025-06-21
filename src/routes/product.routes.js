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

router.use(verifyJWT);
router.route("/").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 3,
    },
  ]),
  createProduct
);
router.route("/").get(getAllProducts);
router
  .route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
