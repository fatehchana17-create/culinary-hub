import { motion } from "framer-motion";
import { Tag, Megaphone, ExternalLink, Clock, Sparkles } from "lucide-react";
import { useGetActiveEvent, useListActiveAds } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

function CountdownBadge({ endDate }: { endDate: string }) {
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const label = days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">
      <Clock className="w-3 h-3" /> {label}
    </span>
  );
}

export function PromotionsSection() {
  const { data: eventData } = useGetActiveEvent();
  const { data: ads } = useListActiveAds();

  const activeEvent = eventData?.event ?? null;
  const activeAds = ads ?? [];

  if (!activeEvent && activeAds.length === 0) return null;

  return (
    <section id="offers" className="py-16 md:py-20 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Offers &amp; Promotions</h2>
            <p className="text-muted-foreground mt-1">Exclusive deals crafted just for you</p>
          </div>
        </motion.div>

        {/* Active Event Banner */}
        {activeEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-secondary p-8 md:p-10 text-white shadow-2xl shadow-primary/30"
          >
            {/* decorative circles */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />

            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm p-5 rounded-2xl w-fit">
                <Tag className="w-10 h-10 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-white text-primary font-bold text-sm px-3 py-1 rounded-full shadow-md">
                    🔥 LIMITED TIME
                  </Badge>
                  <CountdownBadge endDate={activeEvent.endDate} />
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold mb-1 drop-shadow">
                  {activeEvent.name}
                </h3>
                <p className="text-white/80 text-base md:text-lg">
                  Enjoy <span className="font-extrabold text-white">{activeEvent.discountPercentage}% off</span> on all menu items — automatically applied at checkout.
                </p>
              </div>

              {/* Discount badge */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-5 text-center min-w-[120px]">
                <span className="font-display text-5xl font-extrabold leading-none">
                  {activeEvent.discountPercentage}%
                </span>
                <span className="font-semibold text-white/80 text-sm uppercase tracking-widest mt-1">OFF</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Ads Grid */}
        {activeAds.length > 0 && (
          <div className={`grid gap-6 ${activeAds.length === 1 ? "grid-cols-1 max-w-2xl" : activeAds.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
            {activeAds.map((ad, i) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                {ad.link ? (
                  <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block group">
                    <AdCard ad={ad} />
                  </a>
                ) : (
                  <AdCard ad={ad} />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AdCard({ ad }: { ad: { imageUrl: string; title: string; subText?: string | null; link?: string | null } }) {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg group cursor-default hover:shadow-xl transition-shadow duration-300 bg-card border border-border/50">
      <div className="relative h-52 overflow-hidden">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {ad.link && (
          <div className="absolute top-3 right-3 bg-white/90 text-foreground p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-4 h-4" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-start gap-2 mb-1">
            <Megaphone className="w-4 h-4 text-white/70 flex-shrink-0 mt-0.5" />
            <h4 className="font-display text-lg font-bold text-white leading-tight drop-shadow">{ad.title}</h4>
          </div>
          {ad.subText && (
            <p className="text-sm text-white/80 leading-snug pl-6">{ad.subText}</p>
          )}
        </div>
      </div>
      {ad.link && (
        <div className="px-5 py-3 flex items-center gap-2 text-sm font-semibold text-primary bg-card border-t border-border/50">
          <ExternalLink className="w-4 h-4" />
          Learn more
        </div>
      )}
    </div>
  );
}
