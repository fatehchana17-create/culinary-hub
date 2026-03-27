import { useState } from "react";
import { motion } from "framer-motion";
import { 
  useListMenuItems, 
  useListMenuCategories, 
  useGetActiveEvent 
} from "@workspace/api-client-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HeroCarousel } from "@/components/menu/HeroCarousel";
import { MenuCard } from "@/components/menu/MenuCard";
import { Button } from "@/components/ui/button";

export default function PublicMenu() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Queries
  const { data: categories } = useListMenuCategories();
  const { data: menuData, isLoading: isLoadingMenu } = useListMenuItems({ 
    category: activeCategory, 
    page, 
    limit: 20 
  });
  const { data: eventData } = useGetActiveEvent();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <PublicLayout>
      <HeroCarousel />
      
      <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Our Menu</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Hand-crafted dishes prepared with love and the freshest ingredients. 
              Order directly via WhatsApp for lightning-fast service.
            </p>
          </div>
          
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeCategory === undefined ? "default" : "outline"}
                className="rounded-full"
                onClick={() => { setActiveCategory(undefined); setPage(1); }}
              >
                All
              </Button>
              {categories.map(cat => (
                <Button 
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => { setActiveCategory(cat); setPage(1); }}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>

        {isLoadingMenu ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[450px] bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : menuData?.items.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border/50">
            <h3 className="font-display text-2xl mb-2">No items found</h3>
            <p className="text-muted-foreground">Try selecting a different category.</p>
          </div>
        ) : (
          <>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
            >
              {menuData?.items.map(item => (
                <motion.div key={item.id} variants={itemAnim}>
                  <MenuCard item={item} activeEvent={eventData?.event || null} />
                </motion.div>
              ))}
            </motion.div>

            {menuData && menuData.totalPages > 1 && (
              <div className="mt-16 flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 font-semibold text-muted-foreground">
                  Page {page} of {menuData.totalPages}
                </div>
                <Button 
                  variant="outline" 
                  disabled={page === menuData.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </PublicLayout>
  );
}
