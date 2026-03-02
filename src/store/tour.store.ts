import { create } from "zustand";

export interface TourStep {
  title: string;
  description: string;
  emoji: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    emoji: "🎉",
    title: "Welcome to Chatter!",
    description:
      "You've just joined the coolest messaging platform! Let's take a quick 30-second tour so you know where everything lives.",
  },
  {
    emoji: "🤖",
    title: "Meet ChatterBot — Your AI Companion",
    description:
      "ChatterBot is always at the top of your user list. Click its card to start a chat — it's powered by Google Gemini AI and ready to answer questions, have fun conversations, or just say hi!",
  },
  {
    emoji: "👥",
    title: "Discover People",
    description:
      "The Users tab shows everyone on Chatter. Click 'Add Friend' to send a friend request — once accepted, you can message them directly.",
  },
  {
    emoji: "🔍",
    title: "Search & Filter",
    description:
      "Use the search box at the top of the user list to quickly find anyone by name. Results update instantly as you type.",
  },
  {
    emoji: "📬",
    title: "Friend Requests",
    description:
      "Switch to the 'Received' tab to accept incoming friend requests, or 'Sent' to see requests you've made. The 'Friends' tab shows all your connections.",
  },
  {
    emoji: "💬",
    title: "Start Chatting",
    description:
      "Click the 'Message' button on any friend's card to open a floating chat window. You can have multiple conversations open at the same time!",
  },
  {
    emoji: "🚀",
    title: "You're All Set!",
    description:
      "That's everything! If you ever need help, ChatterBot is always here. Enjoy Chatter — happy messaging! 😊",
  },
];

interface TourStore {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  endTour: () => void;
  skipTour: () => void;
}

export const useTourStore = create<TourStore>((set, get) => ({
  isOpen: false,
  currentStep: 0,
  totalSteps: TOUR_STEPS.length,

  startTour: () => set({ isOpen: true, currentStep: 0 }),

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      set({ isOpen: false, currentStep: 0 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  goToStep: (step: number) => set({ currentStep: step }),

  endTour: () => set({ isOpen: false, currentStep: 0 }),

  skipTour: () => set({ isOpen: false, currentStep: 0 }),
}));

export default useTourStore;
