import { describe, it, expect, beforeEach } from "vitest";

import useTourStore, { TOUR_STEPS } from "../src/store/tour.store";

describe("Tour Store", () => {
  beforeEach(() => {
    useTourStore.setState({ isOpen: false, currentStep: 0 });
  });

  it("should initialize with isOpen false and currentStep 0", () => {
    const { isOpen, currentStep, totalSteps } = useTourStore.getState();
    expect(isOpen).toBe(false);
    expect(currentStep).toBe(0);
    expect(totalSteps).toBe(TOUR_STEPS.length);
  });

  it("startTour should set isOpen to true and reset to step 0", () => {
    useTourStore.getState().startTour();
    const { isOpen, currentStep } = useTourStore.getState();
    expect(isOpen).toBe(true);
    expect(currentStep).toBe(0);
  });

  it("nextStep should advance to the next step", () => {
    useTourStore.setState({ isOpen: true, currentStep: 0 });
    useTourStore.getState().nextStep();
    expect(useTourStore.getState().currentStep).toBe(1);
  });

  it("nextStep on the last step should close the tour", () => {
    const lastStep = TOUR_STEPS.length - 1;
    useTourStore.setState({ isOpen: true, currentStep: lastStep });
    useTourStore.getState().nextStep();
    expect(useTourStore.getState().isOpen).toBe(false);
    expect(useTourStore.getState().currentStep).toBe(0);
  });

  it("prevStep should go back one step", () => {
    useTourStore.setState({ isOpen: true, currentStep: 3 });
    useTourStore.getState().prevStep();
    expect(useTourStore.getState().currentStep).toBe(2);
  });

  it("prevStep on step 0 should not go below 0", () => {
    useTourStore.setState({ isOpen: true, currentStep: 0 });
    useTourStore.getState().prevStep();
    expect(useTourStore.getState().currentStep).toBe(0);
  });

  it("goToStep should jump to the specified step", () => {
    useTourStore.setState({ isOpen: true, currentStep: 0 });
    useTourStore.getState().goToStep(4);
    expect(useTourStore.getState().currentStep).toBe(4);
  });

  it("endTour should close the tour and reset to step 0", () => {
    useTourStore.setState({ isOpen: true, currentStep: 2 });
    useTourStore.getState().endTour();
    expect(useTourStore.getState().isOpen).toBe(false);
    expect(useTourStore.getState().currentStep).toBe(0);
  });

  it("skipTour should close the tour and reset to step 0", () => {
    useTourStore.setState({ isOpen: true, currentStep: 3 });
    useTourStore.getState().skipTour();
    expect(useTourStore.getState().isOpen).toBe(false);
    expect(useTourStore.getState().currentStep).toBe(0);
  });

  it("TOUR_STEPS should have 7 steps with expected fields", () => {
    expect(TOUR_STEPS).toHaveLength(7);
    TOUR_STEPS.forEach((step) => {
      expect(step).toHaveProperty("title");
      expect(step).toHaveProperty("description");
      expect(step).toHaveProperty("emoji");
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
      expect(step.emoji).toBeTruthy();
    });
  });
});
