import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  score: number; // 0 to 100
  className?: string;
}

export function ConfidenceMeter({ score, className }: ConfidenceMeterProps) {
  // Determine risk level based on score
  const getLevel = (s: number) => {
    if (s >= 80) return { label: 'High Confidence', color: 'bg-success', text: 'text-success' };
    if (s >= 50) return { label: 'Moderate Risk', color: 'bg-warning', text: 'text-warning' };
    return { label: 'High Risk', color: 'bg-destructive', text: 'text-destructive' };
  };

  const level = getLevel(score);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Safety Analysis
        </span>
        <span className={cn("text-sm font-bold uppercase tracking-tight", level.text)}>
          {level.label}
        </span>
      </div>
      
      {/* Meter Bar */}
      <div className="h-2 w-full bg-secondary overflow-hidden flex gap-px">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className={cn(
              "flex-1 transition-colors duration-500",
              (i + 1) * 10 <= score ? level.color : "bg-transparent"
            )}
          />
        ))}
      </div>
    </div>
  );
}
