// src/app/dashboard/projects/create/components/ProjectCreationStepper.tsx
'use client';
import { type ReactNode } from 'react';

export interface ProjectCreationStepperProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  steps: {
    title: string;
    content: ReactNode;
  }[];
}

export function ProjectCreationStepper({
  currentStep,
  steps
}: ProjectCreationStepperProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg ${
            currentStep === index ? 'bg-blue-50 border-blue-500' : 'bg-white'
          }`}
        >
          <h3 className="font-medium text-lg">{step.title}</h3>
          {currentStep === index && (
            <div className="mt-4">
              {step.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}