import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menuRouter from "./menu";
import eventsRouter from "./events";
import ordersRouter from "./orders";
import adsRouter from "./ads";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/menu", menuRouter);
router.use("/events", eventsRouter);
router.use("/orders", ordersRouter);
router.use("/ads", adsRouter);
router.use("/auth", authRouter);

export default router;
