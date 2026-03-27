import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

function mapOrder(order: typeof ordersTable.$inferSelect) {
  return {
    id: order.id,
    itemDetails: order.itemDetails,
    totalPrice: parseFloat(String(order.totalPrice)),
    customerInfo: order.customerInfo,
    status: order.status,
    createdAt: order.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "50"), 10)));
    const status = req.query.status as string | undefined;
    const offset = (page - 1) * limit;

    const [orders, totalResult] = await Promise.all([
      db.select().from(ordersTable)
        .where(status ? eq(ordersTable.status, status) : undefined)
        .limit(limit).offset(offset)
        .orderBy(ordersTable.createdAt),
      db.select({ count: count() }).from(ordersTable)
        .where(status ? eq(ordersTable.status, status) : undefined),
    ]);

    const total = Number(totalResult[0].count);

    res.json({
      orders: orders.map(mapOrder),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Error listing orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { itemDetails, totalPrice, customerInfo } = req.body;
    const [order] = await db.insert(ordersTable).values({
      itemDetails,
      totalPrice: String(totalPrice),
      customerInfo,
      status: "pending",
    }).returning();
    res.status(201).json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Error creating order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const [order] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Error updating order status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
