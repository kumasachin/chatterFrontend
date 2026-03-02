import { useState, useRef, useEffect, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

import type { User } from "../../types/auth";
import EnhancedUserCard from "../user-card/EnhancedUserCard";

interface LazyUserCardProps {
  user: User;
  onChatClick: () => void;
  isOnline: boolean;
  rootMargin?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyUserCardErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("LazyUserCard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 rounded-lg shadow-sm p-4 h-full flex items-center justify-center">
          <div className="text-red-600 text-sm">Failed to load user</div>
        </div>
      );
    }

    return this.props.children;
  }
}

const LazyUserCard = ({
  user,
  onChatClick,
  isOnline,
  rootMargin = "50px",
}: LazyUserCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = cardRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (!hasBeenVisible) {
              setHasBeenVisible(true);
            }
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        rootMargin,
        threshold: 0.1,
      },
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin, hasBeenVisible]);

  return (
    <LazyUserCardErrorBoundary>
      <div
        ref={cardRef}
        className="relative"
        style={{
          height: 124,
          backgroundColor: isVisible ? "transparent" : "#f9fafb",
        }}
      >
        {hasBeenVisible ? (
          <>
            <EnhancedUserCard user={user} onChatClick={onChatClick} />
            {isOnline && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4 h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </LazyUserCardErrorBoundary>
  );
};

export default LazyUserCard;
