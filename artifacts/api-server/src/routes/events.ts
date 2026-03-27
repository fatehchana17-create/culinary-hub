import { Router, type IRouter } from "express";
import { db, eventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

function isEventCurrentlyActive(event: { startDate: string; endDate: string; isActive: boolean }): boolean {
  if (!event.isActive) return false;
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
}

function mapEvent(event: typeof eventsTable.$inferSelect) {
  return {
    id: event.id,
    name: event.name,
    discountPercentage: parseFloat(String(event.discountPercentage)),
    startDate: event.startDate,
    endDate: event.endDate,
    isActive: event.isActive,
  };
}

router.get("/active", async (req, res) => {
  try {
    const events = await db.select().from(eventsTable).where(eq(eventsTable.isActive, true));
    const activeEvent = events.find((e) => isEventCurrentlyActive({ startDate: e.startDate, endDate: e.endDate, isActive: e.isActive }));
    res.json({ event: activeEvent ? mapEvent(activeEvent) : null });
  } catch (err) {
    req.log.error({ err }, "Error getting active event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const events = await db.select().from(eventsTable).orderBy(eventsTable.id);
    res.json(events.map(mapEvent));
  } catch (err) {
    req.log.error({ err }, "Error listing events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, discountPercentage, startDate, endDate, isActive } = req.body;
    const [event] = await db.insert(eventsTable).values({ name, discountPercentage: String(discountPercentage), startDate, endDate, isActive: isActive ?? true }).returning();
    res.status(201).json(mapEvent(event));
  } catch (err) {
    req.log.error({ err }, "Error creating event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, discountPercentage, startDate, endDate, isActive } = req.body;
    const [event] = await db.update(eventsTable).set({ name, discountPercentage: String(discountPercentage), startDate, endDate, isActive }).where(eq(eventsTable.id, id)).returning();
    if (!event) return res.status(404).json({ error: "Not found" });
    res.json(mapEvent(event));
  } catch (err) {
    req.log.error({ err }, "Error updating event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(eventsTable).where(eq(eventsTable.id, id));
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting event");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
