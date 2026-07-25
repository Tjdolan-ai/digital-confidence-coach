import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Swiss Grid Lines - Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                               linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
             backgroundSize: '4rem 4rem'
           }} 
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto h-16 flex items-center justify-between px-6">
          <Link href="/">
            <a className="text-xl font-bold tracking-tighter uppercase flex items-center gap-2 hover:opacity-70 transition-opacity">
              <div className="w-4 h-4 bg-primary" />
              Digital Confidence Coach
            </a>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wide">
            <Link href="/">
              <a className={cn("hover:text-primary transition-colors", location === "/" && "text-primary")}>
                Tasks
              </a>
            </Link>
            <Link href="/about">
              <a className={cn("hover:text-primary transition-colors", location === "/about" && "text-primary")}>
                Manifesto
              </a>
            </Link>
            <div className="h-4 w-[1px] bg-border" />
            <span className="text-muted-foreground">v1.0</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("relative z-10 pt-24 pb-16 container max-w-7xl mx-auto px-6", className)}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 relative z-10">
        <div className="container max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold uppercase tracking-wider mb-4 text-sm">Safety First</h3>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              This tool is educational and provides decision support. It is not a replacement for professional antivirus software or security audits.
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-between">
            <div className="flex gap-6 text-sm font-medium uppercase">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
            </div>
            <div className="mt-8 text-xs text-muted-foreground font-mono">
              © {new Date().getFullYear()} MANUS AI. SWISS STYLE SYSTEM.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
