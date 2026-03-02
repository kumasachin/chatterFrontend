import React from "react";

import useTourStore, { TOUR_STEPS } from "../../store/tour.store";

const AppTour: React.FC = () => {
  const { isOpen, currentStep, nextStep, prevStep, skipTour, totalSteps } =
    useTourStore();

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      skipTour();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="App tour"
    >
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-[#FB406C] to-[#ff6b8e] transition-all duration-500 ease-in-out"
            style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <button
            onClick={skipTour}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
            aria-label="Skip tour"
          >
            Skip tour
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          <div
            className="text-6xl mb-4 select-none"
            role="img"
            aria-label={step.title}
          >
            {step.emoji}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 pb-2">
          {TOUR_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => useTourStore.getState().goToStep(index)}
              className={`rounded-full transition-all duration-200 ${
                index === currentStep
                  ? "w-5 h-2 bg-[#FB406C]"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
          {!isFirstStep && (
            <button
              onClick={prevStep}
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            onClick={nextStep}
            className={`${isFirstStep || isLastStep ? "flex-1" : "flex-1"} py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#FB406C] to-[#ff6b8e] hover:from-[#e03560] hover:to-[#f05880] transition-all shadow-sm`}
          >
            {isLastStep ? "Let's go! 🚀" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppTour;
