import { Router, type IRouter } from "express";
import { db, menuItemsTable } from "@workspace/db";
import { eq, ilike, and, count, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (category) conditions.push(eq(menuItemsTable.category, category));
    if (search) conditions.push(ilike(menuItemsTable.name, `%${search}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      db.select().from(menuItemsTable).where(where).limit(limit).offset(offset).orderBy(menuItemsTable.id),
      db.select({ count: count() }).from(menuItemsTable).where(where),
    ]);

    const total = Number(totalResult[0].count);

    res.json({
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: parseFloat(String(item.price)),
        imageUrl: item.imageUrl,
        prepTimeLimit: item.prepTimeLimit,
        isAvailable: item.isAvailable,
        createdAt: item.createdAt?.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Error listing menu items");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const rows = await db.selectDistinct({ category: menuItemsTable.category }).from(menuItemsTable).orderBy(menuItemsTable.category);
    res.json(rows.map((r) => r.category));
  } catch (err) {
    req.log.error({ err }, "Error listing categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [item] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, id));
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({
      id: item.id,
      name: item.name,
      category: item.category,
      price: parseFloat(String(item.price)),
      imageUrl: item.imageUrl,
      prepTimeLimit: item.prepTimeLimit,
      isAvailable: item.isAvailable,
      createdAt: item.createdAt?.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting menu item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, category, price, imageUrl, prepTimeLimit, isAvailable } = req.body;
    const [item] = await db.insert(menuItemsTable).values({ name, category, price: String(price), imageUrl, prepTimeLimit: prepTimeLimit ?? 15, isAvailable: isAvailable ?? true }).returning();
    res.status(201).json({
      id: item.id,
      name: item.name,
      category: item.category,
      price: parseFloat(String(item.price)),
      imageUrl: item.imageUrl,
      prepTimeLimit: item.prepTimeLimit,
      isAvailable: item.isAvailable,
      createdAt: item.createdAt?.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating menu item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, category, price, imageUrl, prepTimeLimit, isAvailable } = req.body;
    const [item] = await db.update(menuItemsTable).set({ name, category, price: String(price), imageUrl, prepTimeLimit, isAvailable }).where(eq(menuItemsTable.id, id)).returning();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({
      id: item.id,
      name: item.name,
      category: item.category,
      price: parseFloat(String(item.price)),
      imageUrl: item.imageUrl,
      prepTimeLimit: item.prepTimeLimit,
      isAvailable: item.isAvailable,
      createdAt: item.createdAt?.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating menu item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
    res.json({ success: true, message: "Menu item deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting menu item");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
