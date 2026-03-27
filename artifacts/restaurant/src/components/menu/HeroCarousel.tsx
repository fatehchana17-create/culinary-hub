import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useListActiveAds } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function HeroCarousel() {
  const { data: ads } = useListActiveAds();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  if (!ads || ads.length === 0) {
    // Fallback visually stunning banner
    return (
      <div className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden rounded-3xl mt-6 mx-auto max-w-7xl px-4 lg:px-8">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-placeholder.png`}
          alt="Restaurant Atmosphere"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white px-4 max-w-3xl mx-auto">
          <h1 className="font-display text-5xl md:text-7xl mb-6 leading-tight drop-shadow-lg">
            Experience Culinary <br/> <span className="text-secondary italic">Excellence</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 font-sans drop-shadow">
            Discover a world of flavors crafted with passion and the finest ingredients.
          </p>
          <Button size="lg" onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}>
            View Our Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl group" ref={emblaRef}>
        <div className="flex h-[60vh] min-h-[500px]">
          {ads.map((ad) => (
            <div key={ad.id} className="relative flex-[0_0_100%] min-w-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
              <img 
                src={ad.imageUrl} 
                alt={ad.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}images/hero-placeholder.png`;
                }}
              />
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20 flex flex-col items-start text-white">
                <h2 className="font-display text-4xl md:text-6xl mb-4 leading-tight">
                  {ad.title}
                </h2>
                {ad.subText && (
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl font-sans">
                    {ad.subText}
                  </p>
                )}
                {ad.link && (
                  <Button size="lg" variant="secondary" className="text-secondary-foreground" onClick={() => window.open(ad.link!, '_blank')}>
                    Learn More
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {ads.length > 1 && (
          <div className="absolute bottom-8 right-8 z-30 flex gap-2">
            {ads.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === selectedIndex ? "bg-primary w-8" : "bg-white/50 hover:bg-white"
                }`}
                onClick={() => emblaApi?.scrollTo(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
