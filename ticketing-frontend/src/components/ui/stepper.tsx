import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    {
                      "border-primary bg-primary text-primary-foreground":
                        isCompleted || isCurrent,
                      "border-muted bg-muted text-muted-foreground":
                        !isCompleted && !isCurrent,
                    },
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn("text-sm font-medium", {
                      "text-primary": isCurrent,
                      "text-foreground": isCompleted,
                      "text-muted-foreground": !isCompleted && !isCurrent,
                    })}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 px-2 pb-8">
                  <div
                    className={cn("h-0.5 transition-all", {
                      "bg-primary": isCompleted,
                      "bg-muted": !isCompleted,
                    })}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
