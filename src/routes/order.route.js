import { Router } from "express";
import {
  placeOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  returnOrder,
  cancelOrder
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
router.route("/:id/cancel").patch(cancelOrder);
router.route("/:id/return").post(returnOrder);

export default router;
