import { Router, type IRouter } from "express";
import { db, adsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function mapAd(ad: typeof adsTable.$inferSelect) {
  return {
    id: ad.id,
    imageUrl: ad.imageUrl,
    title: ad.title,
    subText: ad.subText,
    link: ad.link,
    isActive: ad.isActive,
  };
}

router.get("/active", async (req, res) => {
  try {
    const ads = await db.select().from(adsTable).where(eq(adsTable.isActive, true)).orderBy(adsTable.id);
    res.json(ads.map(mapAd));
  } catch (err) {
    req.log.error({ err }, "Error listing active ads");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const ads = await db.select().from(adsTable).orderBy(adsTable.id);
    res.json(ads.map(mapAd));
  } catch (err) {
    req.log.error({ err }, "Error listing ads");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { imageUrl, title, subText, link, isActive } = req.body;
    const [ad] = await db.insert(adsTable).values({ imageUrl, title, subText, link, isActive: isActive ?? true }).returning();
    res.status(201).json(mapAd(ad));
  } catch (err) {
    req.log.error({ err }, "Error creating ad");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { imageUrl, title, subText, link, isActive } = req.body;
    const [ad] = await db.update(adsTable).set({ imageUrl, title, subText, link, isActive }).where(eq(adsTable.id, id)).returning();
    if (!ad) return res.status(404).json({ error: "Not found" });
    res.json(mapAd(ad));
  } catch (err) {
    req.log.error({ err }, "Error updating ad");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(adsTable).where(eq(adsTable.id, id));
    res.json({ success: true, message: "Ad deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting ad");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
