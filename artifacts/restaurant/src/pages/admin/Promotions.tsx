import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Tag, Megaphone, Plus, Edit, Trash2, CalendarRange,
  ToggleLeft, ToggleRight, Link as LinkIcon, XCircle, Sparkles, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import {
  useListEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, Event,
  getListEventsQueryKey,
  useListAds, useCreateAd, useUpdateAd, useDeleteAd, Ad,
  getListAdsQueryKey,
  useGetActiveEvent, getGetActiveEventQueryKey,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "events" | "ads";

// ─── Live discount status banner ────────────────────────────────────────────
function ActiveEventBanner() {
  const queryClient = useQueryClient();
  const { data: activeData } = useGetActiveEvent();
  const { data: events } = useListEvents();
  const { mutate: updateEvent } = useUpdateEvent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetActiveEventQueryKey() });
      },
    },
  });

  const activeEvent = activeData?.event ?? null;
  if (!events || events.length === 0) return null;

  return (
    <div className={`mb-8 p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center gap-4 ${
      activeEvent ? "bg-primary/5 border-primary/30" : "bg-muted/40 border-border/50"
    }`}>
      <div className={`p-3 rounded-xl w-fit ${activeEvent ? "bg-primary/10" : "bg-muted"}`}>
        <Tag className={`w-6 h-6 ${activeEvent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Live Discount Status</p>
        {activeEvent ? (
          <p className="font-display text-xl font-bold">
            <span className="text-primary">{activeEvent.discountPercentage}% OFF</span> — {activeEvent.name} is <span className="text-primary">active</span>
          </p>
        ) : (
          <p className="font-display text-xl font-bold text-muted-foreground">No active discount right now</p>
        )}
      </div>
      {activeEvent && (
        <Button
          variant="outline"
          className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => updateEvent({ id: activeEvent.id, data: { ...activeEvent, isActive: false } })}
        >
          <XCircle className="w-4 h-4" /> Deactivate
        </Button>
      )}
    </div>
  );
}

// ─── Delete confirmation inline component ────────────────────────────────────
function DeleteConfirmButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex gap-1">
        <Button
          variant="destructive" size="sm"
          onClick={() => { onConfirm(); setConfirming(false); }}
          className="flex-1 text-xs"
        >
          Confirm
        </Button>
        <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
          No
        </Button>
      </div>
    );
  }
  return (
    <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

// ─── Events Tab ──────────────────────────────────────────────────────────────
function EventsTab() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetActiveEventQueryKey() });
    setIsEditing(null);
    setIsCreating(false);
  };

  const { data: events, isLoading } = useListEvents();
  const { mutate: createEvent, isPending: creating } = useCreateEvent({ mutation: { onSuccess: invalidate } });
  const { mutate: updateEvent, isPending: updating } = useUpdateEvent({ mutation: { onSuccess: invalidate } });
  const { mutate: deleteEvent } = useDeleteEvent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetActiveEventQueryKey() });
      },
    },
  });
  const { mutate: toggleEvent } = useUpdateEvent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetActiveEventQueryKey() });
      },
    },
  });

  const isPending = creating || updating;

  return (
    <>
      <ActiveEventBanner />

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Create time-limited discount events that appear live on the website.</p>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Discount Event
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border/60">
          <CalendarRange className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg mb-1">No Events Yet</h3>
          <p className="text-muted-foreground text-sm">Create your first discount event to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events?.map(event => {
            const now = new Date();
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            end.setHours(23, 59, 59, 999);
            const isLive = event.isActive && now >= start && now <= end;
            return (
              <Card key={event.id} className={`p-5 flex flex-col gap-4 transition-all ${isLive ? "ring-2 ring-primary/30 border-primary/20" : "opacity-80"}`}>
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl ${isLive ? "bg-primary/10" : "bg-muted"}`}>
                    <CalendarRange className={`w-5 h-5 ${isLive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <Badge variant={isLive ? "default" : event.isActive ? "secondary" : "outline"}>
                    {isLive ? "🟢 Live" : event.isActive ? "Scheduled" : "Disabled"}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">{event.name}</h3>
                  <p className="text-3xl font-extrabold text-primary mt-1">{event.discountPercentage}% OFF</p>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <span className="font-semibold text-foreground">From:</span>
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <span className="font-semibold text-foreground">To:</span>
                    {format(new Date(event.endDate), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button
                    variant="outline" size="sm" className="flex-1 gap-1"
                    onClick={() => toggleEvent({ id: event.id, data: { ...event, isActive: !event.isActive } })}
                  >
                    {event.isActive ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
                    {event.isActive ? "Active" : "Inactive"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(event)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DeleteConfirmButton onConfirm={() => deleteEvent({ id: event.id })} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(isCreating || isEditing) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="w-full max-w-lg shadow-2xl p-6">
                <h2 className="font-display text-2xl mb-6 flex items-center gap-2">
                  <CalendarRange className="w-6 h-6 text-primary" />
                  {isEditing ? "Edit Discount Event" : "New Discount Event"}
                </h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const payload = {
                    name: fd.get("name") as string,
                    discountPercentage: parseFloat(fd.get("discount") as string),
                    startDate: fd.get("start") as string,
                    endDate: fd.get("end") as string,
                    isActive: fd.get("isActive") === "on",
                  };
                  if (isEditing) updateEvent({ id: isEditing.id, data: payload });
                  else createEvent({ data: payload });
                }} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Event Name</label>
                    <Input name="name" defaultValue={isEditing?.name} placeholder="e.g. Weekend Special" required />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Discount Percentage (%)</label>
                    <Input type="number" step="1" min="1" max="100" name="discount" defaultValue={isEditing?.discountPercentage} placeholder="e.g. 15" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold block mb-1.5">Start Date</label>
                      <Input type="date" name="start" defaultValue={isEditing?.startDate?.slice(0, 10)} required />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1.5">End Date</label>
                      <Input type="date" name="end" defaultValue={isEditing?.endDate?.slice(0, 10)} required />
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                    <input type="checkbox" name="isActive" defaultChecked={isEditing ? isEditing.isActive : true} className="w-5 h-5 rounded accent-primary" />
                    <span className="text-sm font-semibold">Enable this event</span>
                  </label>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button type="button" variant="ghost" onClick={() => { setIsEditing(null); setIsCreating(false); }}>Cancel</Button>
                    <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Event"}</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Ads Tab ─────────────────────────────────────────────────────────────────
function AdsTab() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<Ad | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListAdsQueryKey() });
    setIsEditing(null);
    setIsCreating(false);
  };

  const { data: ads, isLoading } = useListAds();
  const { mutate: createAd, isPending: creating } = useCreateAd({ mutation: { onSuccess: invalidate } });
  const { mutate: updateAd, isPending: updating } = useUpdateAd({ mutation: { onSuccess: invalidate } });
  const { mutate: toggleAd } = useUpdateAd({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAdsQueryKey() }),
    },
  });
  const { mutate: deleteAd } = useDeleteAd({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAdsQueryKey() }),
    },
  });

  const isPending = creating || updating;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage banner ads shown in the hero carousel and Offers section.</p>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Ad Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-56 bg-muted/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : ads?.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border/60">
          <Megaphone className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg mb-1">No Ads Yet</h3>
          <p className="text-muted-foreground text-sm">Add your first banner ad to attract customers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ads?.map(ad => (
            <Card key={ad.id} className="overflow-hidden flex flex-col">
              <div className="relative h-44">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3">
                  <Badge variant={ad.isActive ? "default" : "secondary"} className="backdrop-blur-sm shadow">
                    {ad.isActive ? "🟢 Live" : "Hidden"}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-display text-lg font-bold drop-shadow">{ad.title}</h3>
                  {ad.subText && <p className="text-sm text-white/80 drop-shadow">{ad.subText}</p>}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col bg-card gap-3">
                {ad.link && (
                  <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-2 rounded-lg">
                    <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate font-medium">{ad.link}</span>
                  </div>
                )}
                <div className="flex gap-2 mt-auto pt-3 border-t border-border/50">
                  <Button
                    variant="outline" size="sm" className="flex-1 gap-1"
                    onClick={() => toggleAd({ id: ad.id, data: { ...ad, isActive: !ad.isActive } })}
                  >
                    {ad.isActive ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
                    {ad.isActive ? "Visible" : "Hidden"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(ad)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DeleteConfirmButton onConfirm={() => deleteAd({ id: ad.id })} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(isCreating || isEditing) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="w-full max-w-lg shadow-2xl p-6">
                <h2 className="font-display text-2xl mb-6 flex items-center gap-2">
                  <Megaphone className="w-6 h-6 text-primary" />
                  {isEditing ? "Edit Ad Banner" : "New Ad Banner"}
                </h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const payload = {
                    title: fd.get("title") as string,
                    imageUrl: fd.get("imageUrl") as string,
                    subText: (fd.get("subText") as string) || null,
                    link: (fd.get("link") as string) || null,
                    isActive: fd.get("isActive") === "on",
                  };
                  if (isEditing) updateAd({ id: isEditing.id, data: payload });
                  else createAd({ data: payload });
                }} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Ad Title</label>
                    <Input name="title" defaultValue={isEditing?.title} placeholder="e.g. Weekend Special — 15% Off!" required />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Image URL</label>
                    <Input name="imageUrl" defaultValue={isEditing?.imageUrl} placeholder="https://..." required />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Subtext (optional)</label>
                    <Input name="subText" defaultValue={isEditing?.subText || ""} placeholder="e.g. Valid this weekend only" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Link URL (optional)</label>
                    <Input name="link" defaultValue={isEditing?.link || ""} placeholder="https://..." />
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                    <input type="checkbox" name="isActive" defaultChecked={isEditing ? isEditing.isActive : true} className="w-5 h-5 rounded accent-primary" />
                    <span className="text-sm font-semibold">Show on website</span>
                  </label>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button type="button" variant="ghost" onClick={() => { setIsEditing(null); setIsCreating(false); }}>Cancel</Button>
                    <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Ad"}</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PromotionsAdmin() {
  const [tab, setTab] = useState<Tab>("events");

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2 flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          Promotions Control
        </h1>
        <p className="text-muted-foreground">Manage discount events and ad banners — changes appear live on the website instantly.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit mb-8 border border-border/50">
        <button
          onClick={() => setTab("events")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "events"
              ? "bg-card text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tag className="w-4 h-4" />
          Discount Events
        </button>
        <button
          onClick={() => setTab("ads")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "ads"
              ? "bg-card text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Ad Banners
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "events" ? <EventsTab /> : <AdsTab />}
        </motion.div>
      </AnimatePresence>
    </AdminLayout>
  );
}
