import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import HelpPage from "../src/pages/HelpPage";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Mail: vi.fn(() => <div data-testid="mail-icon" />),
  Github: vi.fn(() => <div data-testid="github-icon" />),
  Linkedin: vi.fn(() => <div data-testid="linkedin-icon" />),
  Globe: vi.fn(() => <div data-testid="globe-icon" />),
  Phone: vi.fn(() => <div data-testid="phone-icon" />),
  MapPin: vi.fn(() => <div data-testid="map-pin-icon" />),
  Code: vi.fn(() => <div data-testid="code-icon" />),
  Zap: vi.fn(() => <div data-testid="zap-icon" />),
  Shield: vi.fn(() => <div data-testid="shield-icon" />),
  MessageCircle: vi.fn(() => <div data-testid="message-circle-icon" />),
}));

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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Page Structure and Content", () => {
    it("renders the main heading correctly", () => {
      renderHelpPage();
      expect(screen.getByText("Help & Documentation")).toBeInTheDocument();
    });

    it("displays the developer introduction section", () => {
      renderHelpPage();
      expect(screen.getByText("👨‍💻 About the Developer")).toBeInTheDocument();
      expect(screen.getByText(/Sachin Kumar/)).toBeInTheDocument();
      expect(
        screen.getByText(/passionate full-stack developer/),
      ).toBeInTheDocument();
    });

    it("shows contact information section", () => {
      renderHelpPage();
      expect(screen.getByText("📞 Contact Information")).toBeInTheDocument();
      expect(screen.getByText("sachinkmr53@gmail.com")).toBeInTheDocument();
    });

    it("displays platform features section", () => {
      renderHelpPage();
      expect(screen.getByText("✨ Platform Features")).toBeInTheDocument();
      expect(screen.getByText("Real-time Messaging")).toBeInTheDocument();
      expect(screen.getByText("Secure Authentication")).toBeInTheDocument();
      expect(screen.getByText("AI Chat Assistant")).toBeInTheDocument();
      expect(screen.getByText("Modern Tech Stack")).toBeInTheDocument();
    });

    it("shows technical stack information", () => {
      renderHelpPage();
      expect(screen.getByText("🛠️ Technical Stack")).toBeInTheDocument();
      expect(screen.getByText("Frontend")).toBeInTheDocument();
      expect(screen.getByText("Backend")).toBeInTheDocument();
      expect(screen.getByText("Deployment")).toBeInTheDocument();
    });
  });

  describe("Contact Links and Navigation", () => {
    it("renders email contact link with correct href", () => {
      renderHelpPage();
      const emailLink = screen.getByRole("link", { name: /Email/ });
      expect(emailLink).toHaveAttribute("href", "mailto:sachinkmr53@gmail.com");
    });

    it("renders GitHub link with correct attributes", () => {
      renderHelpPage();
      const githubLink = screen.getByRole("link", { name: /GitHub/ });
      expect(githubLink).toHaveAttribute(
        "href",
        "https://github.com/kumasachin",
      );
      expect(githubLink).toHaveAttribute("target", "_blank");
      expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders LinkedIn link with correct attributes", () => {
      renderHelpPage();
      const linkedinLink = screen.getByRole("link", { name: /LinkedIn/ });
      expect(linkedinLink).toHaveAttribute(
        "href",
        "https://linkedin.com/in/sachin-kumar-dev",
      );
      expect(linkedinLink).toHaveAttribute("target", "_blank");
    });

    it("renders portfolio link with correct attributes", () => {
      renderHelpPage();
      const portfolioLink = screen.getByRole("link", { name: /Portfolio/ });
      expect(portfolioLink).toHaveAttribute("href", "https://sachink.dev");
      expect(portfolioLink).toHaveAttribute("target", "_blank");
    });
  });

  describe("Technical Information Display", () => {
    it("displays frontend technologies correctly", () => {
      renderHelpPage();
      expect(
        screen.getByText(/React 19.1.0 with TypeScript/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Vite for fast development/)).toBeInTheDocument();
      expect(screen.getByText(/Tailwind CSS for styling/)).toBeInTheDocument();
      expect(
        screen.getByText(/Zustand for state management/),
      ).toBeInTheDocument();
    });

    it("displays backend technologies correctly", () => {
      renderHelpPage();
      expect(screen.getByText(/Node.js with Express.js/)).toBeInTheDocument();
      expect(screen.getByText(/MongoDB with Mongoose ODM/)).toBeInTheDocument();
      expect(
        screen.getByText(/Socket.IO for real-time communication/),
      ).toBeInTheDocument();
      expect(screen.getByText(/JWT for authentication/)).toBeInTheDocument();
    });

    it("displays deployment information correctly", () => {
      renderHelpPage();
      expect(screen.getByText(/Frontend: Vercel\/Render/)).toBeInTheDocument();
      expect(screen.getByText(/Backend: Render/)).toBeInTheDocument();
      expect(screen.getByText(/Database: MongoDB Atlas/)).toBeInTheDocument();
    });
  });

  describe("Feature Descriptions", () => {
    it("describes real-time messaging feature", () => {
      renderHelpPage();
      expect(
        screen.getByText(/Instant messaging with Socket.IO/),
      ).toBeInTheDocument();
    });

    it("describes secure authentication feature", () => {
      renderHelpPage();
      expect(screen.getByText(/JWT-based authentication/)).toBeInTheDocument();
    });

    it("describes AI chat assistant feature", () => {
      renderHelpPage();
      expect(
        screen.getByText(/Google Gemini AI integration/),
      ).toBeInTheDocument();
    });

    it("describes modern tech stack feature", () => {
      renderHelpPage();
      expect(
        screen.getByText(/React 19, TypeScript, Node.js/),
      ).toBeInTheDocument();
    });
  });

  describe("Usage Instructions", () => {
    it("displays how to use section", () => {
      renderHelpPage();
      expect(screen.getByText("📚 How to Use Chatter")).toBeInTheDocument();
      expect(screen.getByText("Getting Started")).toBeInTheDocument();
    });

    it("shows step-by-step instructions", () => {
      renderHelpPage();
      expect(
        screen.getByText(/Create an account using the signup form/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Complete your profile/)).toBeInTheDocument();
      expect(screen.getByText(/Send friend requests/)).toBeInTheDocument();
    });

    it("displays AI assistant features", () => {
      renderHelpPage();
      expect(screen.getByText("AI Assistant Features")).toBeInTheDocument();
      expect(
        screen.getByText(/Ask ChatterBot about Chatter platform/),
      ).toBeInTheDocument();
    });
  });

  describe("Project Goals and Objectives", () => {
    it("displays project objectives section", () => {
      renderHelpPage();
      expect(screen.getByText("🎯 Project Objectives")).toBeInTheDocument();
      expect(screen.getByText("Technical Goals")).toBeInTheDocument();
      expect(screen.getByText("Business Goals")).toBeInTheDocument();
    });

    it("lists technical goals correctly", () => {
      renderHelpPage();
      expect(
        screen.getByText(/Demonstrate modern React development/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Showcase real-time communication skills/),
      ).toBeInTheDocument();
    });

    it("lists business goals correctly", () => {
      renderHelpPage();
      expect(
        screen.getByText(/Create engaging user experiences/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Build production-ready applications/),
      ).toBeInTheDocument();
    });
  });

  describe("Support and Feedback Section", () => {
    it("displays support section", () => {
      renderHelpPage();
      expect(screen.getByText("💬 Support & Feedback")).toBeInTheDocument();
    });

    it("shows different support categories", () => {
      renderHelpPage();
      expect(screen.getByText("🐛 Report Issues")).toBeInTheDocument();
      expect(screen.getByText("💡 Feature Requests")).toBeInTheDocument();
      expect(screen.getByText("🤝 Collaboration")).toBeInTheDocument();
      expect(screen.getByText("📚 Learning")).toBeInTheDocument();
    });

    it("provides helpful descriptions for each support category", () => {
      renderHelpPage();
      expect(
        screen.getByText(/Found a bug? Please report it via email/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Have ideas for new features?/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Interested in working together?/),
      ).toBeInTheDocument();
    });
  });

  describe("Developer Information and Skills", () => {
    it("showcases developer specializations", () => {
      renderHelpPage();
      expect(screen.getByText("🎯 Specializations")).toBeInTheDocument();
      expect(
        screen.getByText(/React & TypeScript Development/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Node.js & Express.js APIs/)).toBeInTheDocument();
      expect(screen.getByText(/Real-time Applications/)).toBeInTheDocument();
    });

    it("displays location and role information", () => {
      renderHelpPage();
      expect(screen.getByText(/Based in India/)).toBeInTheDocument();
      expect(screen.getByText(/Full-Stack Developer/)).toBeInTheDocument();
    });

    it("shows comprehensive skill set", () => {
      renderHelpPage();
      expect(screen.getByText(/AI Integration & Chatbots/)).toBeInTheDocument();
      expect(
        screen.getByText(/Database Design & Optimization/),
      ).toBeInTheDocument();
      expect(screen.getByText(/DevOps & Cloud Deployment/)).toBeInTheDocument();
    });
  });

  describe("Accessibility and User Experience", () => {
    it("uses semantic HTML elements", () => {
      renderHelpPage();
      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
    });

    it("provides proper link text for screen readers", () => {
      renderHelpPage();
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
        expect(link.textContent).toBeTruthy();
      });
    });

    it("uses appropriate heading hierarchy", () => {
      renderHelpPage();
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Help & Documentation");

      const h2s = screen.getAllByRole("heading", { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });
  });

  describe("Content Quality and Professionalism", () => {
    it("demonstrates technical expertise through detailed descriptions", () => {
      renderHelpPage();
      const techContent = screen.getByText(
        /Socket.IO for real-time communication/,
      );
      expect(techContent).toBeInTheDocument();
    });

    it("shows professional presentation with emojis and clear structure", () => {
      renderHelpPage();
      // Check for professional emojis and structure
      expect(screen.getByText("👨‍💻 About the Developer")).toBeInTheDocument();
      expect(screen.getByText("🛠️ Technical Stack")).toBeInTheDocument();
      expect(screen.getByText("✨ Platform Features")).toBeInTheDocument();
    });

    it("provides comprehensive contact and collaboration information", () => {
      renderHelpPage();
      expect(
        screen.getByText(/always excited to hear from users/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/discuss potential collaborations/),
      ).toBeInTheDocument();
    });
  });
});
