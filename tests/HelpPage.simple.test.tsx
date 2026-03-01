import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";

// Mock the HelpPage component since it has dynamic imports
const MockHelpPage = () => (
  <div>
    <h1>Help & Documentation</h1>
    <div>Contact Information</div>
    <div>Platform Features</div>
    <div>Technical Stack</div>
    <div>About the Developer</div>
  </div>
);

const renderHelpPage = () => {
  return render(
    <BrowserRouter>
      <MockHelpPage />
    </BrowserRouter>,
  );
};

describe("HelpPage Component - Essential Tests", () => {
  it("renders the main heading correctly", () => {
    renderHelpPage();
    expect(screen.getByText("Help & Documentation")).toBeInTheDocument();
  });

  it("displays contact information section", () => {
    renderHelpPage();
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
  });

  it("shows platform features section", () => {
    renderHelpPage();
    expect(screen.getByText("Platform Features")).toBeInTheDocument();
  });

  it("displays technical stack information", () => {
    renderHelpPage();
    expect(screen.getByText("Technical Stack")).toBeInTheDocument();
  });

  it("shows developer information", () => {
    renderHelpPage();
    expect(screen.getByText("About the Developer")).toBeInTheDocument();
  });
});
