import { LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  index: number;
}

export function TaskCard({ title, description, icon: Icon, onClick, index }: TaskCardProps) {
  // Format index to always be two digits (01, 02, etc.)
  const formattedIndex = (index + 1).toString().padStart(2, '0');

  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col text-left w-full h-full border border-border bg-card hover:border-primary transition-colors duration-200 overflow-hidden"
    >
      {/* Top Section with Number and Icon */}
      <div className="p-6 flex justify-between items-start w-full border-b border-border/50 group-hover:border-primary/20 transition-colors">
        <span className="font-mono text-4xl font-light text-muted-foreground/40 group-hover:text-primary/40 transition-colors">
          {formattedIndex}
        </span>
        <div className="p-3 bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon size={24} strokeWidth={1.5} />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-grow flex flex-col justify-between gap-8">
        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
          Start Flow <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] pointer-events-none transition-colors" />
    </button>
  );
}
