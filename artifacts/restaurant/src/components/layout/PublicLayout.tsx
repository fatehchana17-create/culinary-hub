import { ReactNode } from "react";
import { Link } from "wouter";
import { ChefHat, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative pb-24 lg:pb-0">
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-primary to-secondary p-2.5 rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              Savoria
            </span>
          </Link>
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">Menu</Link>
            <a href="#offers" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Offers</a>
            <a href="#about" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">About Us</a>
            <a href="#location" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Location</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <AnimatePresence>
        <motion.a
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl shadow-[#25D366]/30 hover:-translate-y-1 hover:shadow-[#25D366]/50 transition-all duration-300 group flex items-center justify-center"
        >
          <MessageCircle className="w-8 h-8" />
          <span className="absolute right-full mr-4 bg-foreground text-background px-3 py-1.5 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with us!
          </span>
        </motion.a>
      </AnimatePresence>
    </div>
  );
}
