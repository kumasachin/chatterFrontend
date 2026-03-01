import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";

import HelpPage from "../src/pages/HelpPage";

// Mock react-router-dom Link component
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Link: ({
      to,
      children,
      className,
    }: {
      to: string;
      children: React.ReactNode;
      className?: string;
    }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  };
});

const renderHelpPage = () => {
  return render(
    <BrowserRouter>
      <HelpPage />
    </BrowserRouter>,
  );
};

describe("HelpPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering and Layout", () => {
    it("should render main heading and description", () => {
      renderHelpPage();

      expect(screen.getByText("Chatter Help Center")).toBeInTheDocument();
      expect(
        screen.getByText("Everything you need to know about using Chatter"),
      ).toBeInTheDocument();
    });

    it("should render all navigation sections", () => {
      renderHelpPage();

      const sections = [
        "Getting Started",
        "Platform Features",
        "Technology",
        "Troubleshooting",
        "Contact & Support",
      ];

      sections.forEach((section) => {
        expect(screen.getByText(section)).toBeInTheDocument();
      });
    });

    it("should have getting started section active by default", () => {
      renderHelpPage();

      expect(screen.getByText("Welcome to Chatter! 🚀")).toBeInTheDocument();
      expect(screen.getByText("Quick Start Guide")).toBeInTheDocument();
    });

    it("should render Chat with ChatterBot button", () => {
      renderHelpPage();

      const chatButton = screen.getByText("Chat with ChatterBot");
      expect(chatButton).toBeInTheDocument();
      expect(chatButton.closest("a")).toHaveAttribute("href", "/chat");
    });

    it("should render back to app link", () => {
      renderHelpPage();

      const backLink = screen.getByText("← Back to Chatter");
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest("a")).toHaveAttribute("href", "/");
    });
  });

  describe("Section Navigation", () => {
    it("should switch to platform features section when clicked", async () => {
      renderHelpPage();

      const featuresButton = screen.getByText("Platform Features");
      fireEvent.click(featuresButton);

      await waitFor(() => {
        expect(screen.getByText("Amazing Features 🌟")).toBeInTheDocument();
        expect(screen.getByText("AI-Powered ChatterBot")).toBeInTheDocument();
      });
    });

    it("should switch to technology section when clicked", async () => {
      renderHelpPage();

      const techButton = screen.getByText("Technology");
      fireEvent.click(techButton);

      await waitFor(() => {
        expect(
          screen.getByText("Built with Modern Tech 🛠️"),
        ).toBeInTheDocument();
        expect(screen.getByText("Frontend Technologies")).toBeInTheDocument();
        expect(screen.getByText("Backend Technologies")).toBeInTheDocument();
      });
    });

    it("should switch to troubleshooting section when clicked", async () => {
      renderHelpPage();

      const troubleshootingButton = screen.getByText("Troubleshooting");
      fireEvent.click(troubleshootingButton);

      await waitFor(() => {
        expect(
          screen.getByText("Common Issues & Solutions 🔧"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Can't receive verification email?"),
        ).toBeInTheDocument();
      });
    });

    it("should switch to contact section when clicked", async () => {
      renderHelpPage();

      const contactButton = screen.getByText("Contact & Support");
      fireEvent.click(contactButton);

      await waitFor(() => {
        expect(screen.getByText("Get in Touch 📞")).toBeInTheDocument();
        expect(screen.getByText("Email Support")).toBeInTheDocument();
        expect(screen.getByText("About the Developer")).toBeInTheDocument();
      });
    });

    it("should update active state when section is selected", async () => {
      renderHelpPage();

      const featuresButton = screen.getByText("Platform Features");
      fireEvent.click(featuresButton);

      await waitFor(() => {
        // Check if the button has active styling (this is implementation-specific)
        expect(featuresButton.closest("button")).toHaveClass("bg-blue-100");
      });
    });
  });

  describe("Content Validation", () => {
    it("should display comprehensive getting started content", () => {
      renderHelpPage();

      expect(screen.getByText("Quick Start Guide")).toBeInTheDocument();
      expect(
        screen.getByText("Create your account with a unique username"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Verify your email address (check spam folder if needed)",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Start chatting with ChatterBot - your AI friend!"),
      ).toBeInTheDocument();
      expect(screen.getByText("Try Guest Mode")).toBeInTheDocument();
    });

    it("should showcase all key features in features section", async () => {
      renderHelpPage();

      const featuresButton = screen.getByText("Platform Features");
      fireEvent.click(featuresButton);

      await waitFor(() => {
        expect(screen.getByText("AI-Powered ChatterBot")).toBeInTheDocument();
        expect(screen.getByText("Real-time Messaging")).toBeInTheDocument();
        expect(screen.getByText("Smart Notifications")).toBeInTheDocument();
        expect(screen.getByText("Friend System")).toBeInTheDocument();
        expect(
          screen.getByText("Multiple chat windows support"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Email verification system"),
        ).toBeInTheDocument();
      });
    });

    it("should display comprehensive technology stack", async () => {
      renderHelpPage();

      const techButton = screen.getByText("Technology");
      fireEvent.click(techButton);

      await waitFor(() => {
        // Frontend technologies
        expect(screen.getByText("React 19")).toBeInTheDocument();
        expect(screen.getByText("TypeScript")).toBeInTheDocument();
        expect(screen.getByText("Vite")).toBeInTheDocument();
        expect(screen.getByText("Tailwind CSS")).toBeInTheDocument();
        expect(screen.getByText("Socket.IO Client")).toBeInTheDocument();
        expect(screen.getByText("Zustand")).toBeInTheDocument();

        // Backend technologies
        expect(screen.getByText("Node.js")).toBeInTheDocument();
        expect(screen.getByText("Express.js")).toBeInTheDocument();
        expect(screen.getByText("MongoDB")).toBeInTheDocument();
        expect(screen.getByText("Socket.IO")).toBeInTheDocument();
        expect(screen.getByText("Google Gemini AI")).toBeInTheDocument();
        expect(screen.getByText("JWT")).toBeInTheDocument();
      });
    });

    it("should provide practical troubleshooting solutions", async () => {
      renderHelpPage();

      const troubleshootingButton = screen.getByText("Troubleshooting");
      fireEvent.click(troubleshootingButton);

      await waitFor(() => {
        expect(
          screen.getByText("Can't receive verification email?"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Check your spam/junk folder"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Messages not appearing in real-time?"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("ChatterBot not responding?"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Not receiving notifications?"),
        ).toBeInTheDocument();
      });
    });

    it("should display professional contact information", async () => {
      renderHelpPage();

      const contactButton = screen.getByText("Contact & Support");
      fireEvent.click(contactButton);

      await waitFor(() => {
        expect(screen.getByText("Email Support")).toBeInTheDocument();
        expect(screen.getByText("Live Chat")).toBeInTheDocument();
        expect(screen.getByText("About the Developer")).toBeInTheDocument();
        expect(screen.getByText("Sachin Kumar")).toBeInTheDocument();
        expect(screen.getByText("full-stack developer")).toBeInTheDocument();
        expect(
          screen.getByText("innovative web applications"),
        ).toBeInTheDocument();

        // Professional tags
        expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
        expect(screen.getByText("AI Enthusiast")).toBeInTheDocument();
        expect(screen.getByText("React Expert")).toBeInTheDocument();
      });
    });
  });

  describe("Links and Navigation", () => {
    it("should have correct email link", async () => {
      renderHelpPage();

      const contactButton = screen.getByText("Contact & Support");
      fireEvent.click(contactButton);

      await waitFor(() => {
        const emailLink = screen.getByText("sachin@chatter.dev");
        expect(emailLink.closest("a")).toHaveAttribute(
          "href",
          "mailto:sachin@chatter.dev",
        );
      });
    });

    it("should have chat link in contact section", async () => {
      renderHelpPage();

      const contactButton = screen.getByText("Contact & Support");
      fireEvent.click(contactButton);

      await waitFor(() => {
        const chatLink = screen.getByText("Start Chatting →");
        expect(chatLink.closest("a")).toHaveAttribute("href", "/chat");
      });
    });

    it("should have multiple help and guide links", async () => {
      renderHelpPage();

      const featuresButton = screen.getByText("Platform Features");
      fireEvent.click(featuresButton);

      await waitFor(() => {
        const helpLinks = screen.getAllByText("Help & Guide");
        expect(helpLinks.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Professional Presentation", () => {
    it("should present developer skills professionally", async () => {
      renderHelpPage();

      const contactButton = screen.getByText("Contact & Support");
      fireEvent.click(contactButton);

      await waitFor(() => {
        // Should showcase skills without being boastful
        expect(screen.getByText("crafted with passion")).toBeInTheDocument();
        expect(
          screen.getByText("modern development practices"),
        ).toBeInTheDocument();
        expect(screen.getByText("AI integration")).toBeInTheDocument();
        expect(screen.getByText("user-centric design")).toBeInTheDocument();
      });
    });

    it("should highlight technical achievements appropriately", async () => {
      renderHelpPage();

      const techButton = screen.getByText("Technology");
      fireEvent.click(techButton);

      await waitFor(() => {
        expect(
          screen.getByText("carefully chosen for performance"),
        ).toBeInTheDocument();
        expect(screen.getByText("scalability")).toBeInTheDocument();
        expect(screen.getByText("developer experience")).toBeInTheDocument();
        expect(
          screen.getByText("modern web development best practices"),
        ).toBeInTheDocument();
      });
    });

    it("should maintain professional tone throughout", () => {
      renderHelpPage();

      // Check for professional language markers
      expect(
        screen.getByText("Everything you need to know"),
      ).toBeInTheDocument();

      // Should not contain overly casual language
      const content = screen.getByTestId
        ? screen.getByTestId("help-content")
        : document.body;
      expect(content.textContent).not.toContain("totally awesome");
      expect(content.textContent).not.toContain("super cool");
      expect(content.textContent).not.toContain("amazing stuff");
    });
  });

  describe("Accessibility and UX", () => {
    it("should have proper heading hierarchy", () => {
      renderHelpPage();

      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toHaveTextContent("Chatter Help Center");
    });

    it("should have navigation buttons with proper roles", () => {
      renderHelpPage();

      const navigationButtons = screen.getAllByRole("button");
      expect(navigationButtons.length).toBeGreaterThan(0);

      navigationButtons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });

    it("should provide clear visual feedback for active section", async () => {
      renderHelpPage();

      const techButton = screen.getByText("Technology");
      fireEvent.click(techButton);

      await waitFor(() => {
        // Active button should have different styling
        expect(techButton.closest("button")).toHaveClass("bg-blue-100");
      });
    });

    it("should be keyboard navigable", () => {
      renderHelpPage();

      const firstButton = screen.getByText("Getting Started");
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
    });
  });
});
