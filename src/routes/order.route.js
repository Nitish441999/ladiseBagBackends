import { Router } from "express";
import {
  placeOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  returnOrder,
  cancleOrder,
} from "../controllers/order.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
const router = Router();
router.use(verifyJWT);
router.route("/").post(placeOrder).get(getAllOrders);
router
  .route("/:id")
  .get(getOrderById)
  .patch(updateOrderStatus)
  .delete(deleteOrder);
router.route("/:id/cancel").post(cancleOrder);
router.route("/:id/return").post(returnOrder);

export default router;
