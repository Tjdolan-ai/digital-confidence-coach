import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { tasks } from "@/lib/data";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { validateUrl, validateFileExtension } from "@/lib/safety";
import { cn } from "@/lib/utils";

export default function TaskFlow() {
  const [match, params] = useRoute("/task/:id");
  const [, setLocation] = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [validationMsg, setValidationMsg] = useState<{ msg: string; type: 'safe' | 'warning' | 'danger' } | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  if (!match || !params) return null;

  const task = tasks.find(t => t.id === params.id);
  if (!task) {
    setLocation("/404");
    return null;
  }

  const currentStep = task.steps[currentStepIndex];
  const isLastStep = currentStepIndex === task.steps.length - 1;
  const progress = ((currentStepIndex + 1) / task.steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      // Navigate to summary/success page (to be implemented)
      setLocation(`/task/${task.id}/summary`);
    } else {
      setCurrentStepIndex(prev => prev + 1);
      setInputValue("");
      setValidationMsg(null);
      setIsChecked(false);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setInputValue("");
      setValidationMsg(null);
      setIsChecked(false);
    } else {
      setLocation("/");
    }
  };

  const handleValidation = (value: string) => {
    setInputValue(value);
    if (!currentStep.validation) return;

    if (currentStep.validation.type === 'url') {
      const res = validateUrl(value);
      if (!res.isValid) {
        setValidationMsg({ msg: res.message || 'Invalid URL', type: res.riskLevel });
      } else if (res.message) {
        setValidationMsg({ msg: res.message, type: res.riskLevel });
      } else {
        setValidationMsg({ msg: 'URL looks valid', type: 'safe' });
      }
    }
  };

  const canProceed = () => {
    if (currentStep.type === 'check') return isChecked;
    if (currentStep.type === 'input' && currentStep.validation) {
      return inputValue.length > 0 && validationMsg?.type !== 'danger';
    }
    return true;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header / Progress */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6 text-sm font-mono uppercase tracking-widest text-muted-foreground">
            <button onClick={() => setLocation("/")} className="hover:text-primary transition-colors">
              Tasks
            </button>
            <span>/</span>
            <span className="text-foreground">{task.title}</span>
          </div>
          
          <div className="h-1 w-full bg-border relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs font-mono uppercase text-muted-foreground">
            <span>Step {currentStepIndex + 1} of {task.steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Main Step Content */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Instruction */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">
                {currentStep.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Interactive Area */}
            <div className="p-8 border border-border bg-card">
              {currentStep.type === 'input' && (
                <div className="space-y-4">
                  <Input 
                    value={inputValue}
                    onChange={(e) => handleValidation(e.target.value)}
                    placeholder="Paste here..."
                    className="font-mono text-lg p-6 h-auto bg-background border-border focus:ring-0 focus:border-primary rounded-none"
                  />
                  {validationMsg && (
                    <div className={cn(
                      "flex items-center gap-2 text-sm font-medium p-3 border-l-2",
                      validationMsg.type === 'safe' ? "border-success text-success bg-success/5" :
                      validationMsg.type === 'warning' ? "border-warning text-warning bg-warning/5" :
                      "border-destructive text-destructive bg-destructive/5"
                    )}>
                      {validationMsg.type === 'safe' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      {validationMsg.msg}
                    </div>
                  )}
                </div>
              )}

              {currentStep.type === 'check' && (
                <div className="flex items-start gap-4 p-4 hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setIsChecked(!isChecked)}>
                  <Checkbox 
                    checked={isChecked}
                    onCheckedChange={(c) => setIsChecked(!!c)}
                    className="mt-1 rounded-none border-2 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="space-y-1">
                    <label className="text-lg font-medium cursor-pointer">
                      I have confirmed this step
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Click to verify you have completed the action above.
                    </p>
                  </div>
                </div>
              )}

              {currentStep.type === 'info' && (
                <div className="flex items-center gap-4 text-primary">
                  <Info size={24} />
                  <span className="font-medium">Read the information above carefully before proceeding.</span>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="rounded-none hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
                className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-bold uppercase tracking-wide disabled:opacity-50"
              >
                {isLastStep ? 'Finish' : 'Continue'} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right: Context/Why it matters */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 border-l-2 border-primary/20 pl-6 py-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">
                Why This Matters
              </h3>
              <ul className="space-y-4">
                {currentStep.whyItMatters.map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
