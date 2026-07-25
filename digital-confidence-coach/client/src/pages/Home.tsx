import { Layout } from "@/components/Layout";
import { TaskCard } from "@/components/TaskCard";
import { tasks } from "@/lib/data";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="mb-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-block px-3 py-1 border border-primary text-primary text-xs font-bold uppercase tracking-widest">
            System Status: Online
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9]">
            DIGITAL <br />
            <span className="text-primary">CONFIDENCE</span> <br />
            COACH
          </h1>
          <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
            A step-by-step guidance system for non-technical users to safely complete intimidating tech tasks.
          </p>
        </div>
        
        {/* Abstract Visual */}
        <div className="hidden md:block relative aspect-square border border-border bg-secondary/30 overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="bg-primary/10 border-r border-b border-border" />
            <div className="border-b border-border" />
            <div className="border-r border-border" />
            <div className="bg-muted/20" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-primary rounded-full mix-blend-multiply opacity-20 blur-3xl" />
        </div>
      </section>

      {/* Task Grid */}
      <section id="tasks" className="space-y-12">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Select a Protocol</h2>
          <span className="font-mono text-sm text-muted-foreground">01 — 06</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              index={index}
              title={task.title}
              description={task.description}
              icon={task.icon}
              onClick={() => setLocation(`/task/${task.id}`)}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
}
