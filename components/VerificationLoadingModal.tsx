"use client";

import { useEffect, useState } from "react";

interface VerificationLoadingModalProps {
  isOpen: boolean;
  playerName?: string;
}

export default function VerificationLoadingModal({
  isOpen,
  playerName
}: VerificationLoadingModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'basic' | 'history' | 'processing'>('basic');

  // Stages with their duration and display info
  const stages = {
    basic: {
      label: 'Verifying player',
      duration: 8000, // 8 seconds
      targetProgress: 35,
    },
    history: {
      label: 'Loading match records',
      duration: 25000, // 25 seconds (most time-consuming)
      targetProgress: 85,
    },
    processing: {
      label: 'Calculating stats',
      duration: 7000, // 7 seconds
      targetProgress: 100,
    },
  };

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStep('basic');
      return;
    }

    // Simulate progressive loading
    let currentProgress = 0;
    let stepStartTime = Date.now();
    let stage: keyof typeof stages = 'basic';

    const interval = setInterval(() => {
      const elapsed = Date.now() - stepStartTime;
      const currentStage = stages[stage];

      // Calculate progress for current stage
      const stageProgress = Math.min(
        (elapsed / currentStage.duration) * (currentStage.targetProgress - currentProgress),
        currentStage.targetProgress - currentProgress
      );

      const newProgress = currentProgress + stageProgress;
      setProgress(Math.min(newProgress, 100));

      // Transition to next stage
      if (elapsed >= currentStage.duration) {
        currentProgress = currentStage.targetProgress;

        if (stage === 'basic') {
          stage = 'history';
          setCurrentStep('history');
          stepStartTime = Date.now();
        } else if (stage === 'history') {
          stage = 'processing';
          setCurrentStep('processing');
          stepStartTime = Date.now();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const getStepStatus = (step: keyof typeof stages) => {
    const stepOrder = ['basic', 'history', 'processing'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-[#0E1414] rounded-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-lg w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 border border-brand/20 mb-4">
            <svg
              className="w-8 h-8 text-brand animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white/90 mb-2">
            Verifying Player
          </h2>
          {playerName && (
            <p className="text-sm text-white/60">
              {playerName}
            </p>
          )}
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/60 uppercase tracking-wider">
              Overall Progress
            </span>
            <span className="text-xs text-brand font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-muted via-brand to-brand-light transition-all duration-300 ease-out rounded-full"
              style={{
                width: `${progress}%`,
                boxShadow: '0 0 12px rgba(149, 232, 75, 0.4)'
              }}
            />
          </div>
        </div>

        {/* Stage Steps */}
        <div className="space-y-4">
          {(Object.keys(stages) as Array<keyof typeof stages>).map((step) => {
            const status = getStepStatus(step);
            const stage = stages[step];

            return (
              <div
                key={step}
                className={`flex items-start gap-3 transition-all duration-300 ${
                  status === 'active' ? 'opacity-100' : status === 'completed' ? 'opacity-60' : 'opacity-30'
                }`}
              >
                {/* Step Icon */}
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  status === 'completed'
                    ? 'bg-brand border-brand'
                    : status === 'active'
                    ? 'bg-brand/20 border-brand animate-pulse'
                    : 'bg-white/5 border-white/10'
                }`}>
                  {status === 'completed' ? (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : status === 'active' ? (
                    <div className="w-2 h-2 bg-brand rounded-full" />
                  ) : (
                    <div className="w-2 h-2 bg-white/20 rounded-full" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-0.5">
                  <p className={`text-sm font-medium transition-colors ${
                    status === 'active' ? 'text-white' : 'text-white/70'
                  }`}>
                    {stage.label}
                  </p>

                  {/* Animated dots for active step */}
                  {status === 'active' && (
                    <div className="flex gap-1 mt-1">
                      <span className="w-1 h-1 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-xs text-white/40 text-center">
            This may take 30-45 seconds. We&apos;re verifying your complete profile.
          </p>
        </div>
      </div>
    </div>
  );
}
