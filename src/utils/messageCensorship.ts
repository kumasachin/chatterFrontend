// Using named import for bad-words library
import { Filter } from "bad-words";

interface CensorshipConfig {
  strictMode: boolean;
  customWords: string[];
  allowWhitelist: boolean;
  whitelist: string[];
  enableNameValidation: boolean;
}

const defaultConfig: CensorshipConfig = {
  strictMode: true, // Strict mode for name validation
  customWords: [],
  allowWhitelist: true,
  whitelist: ["damn", "hell"],
  enableNameValidation: true,
};

// Initialize bad-words filter
const filter = new Filter();

// Add custom inappropriate words for more comprehensive filtering
const additionalBadWords = [
  "nazi",
  "hitler",
  "terrorist",
  "suicide",
  "bomb",
  "kill",
  "murder",
  "rape",
  "assault",
  "abuse",
  "violence",
  "hate",
  "racism",
  "sexism",
  "discrimination",
  "harassment",
  "stupid",
  "idiot",
  "moron",
  "retard",
  "loser",
  "freak",
  "dumb",
  "ugly",
];

// Add custom words to the filter
filter.addWords(...additionalBadWords);

const spamPatterns = [
  /(.)\1{4,}/g, // Repeated characters (aaaa)
  /[A-Z]{5,}/g, // ALL CAPS words
  /(.{1,3})\1{3,}/g, // Repeated patterns (lollollol)
];

export class MessageCensor {
  private config: CensorshipConfig;
  private filter: Filter;

  constructor(config: Partial<CensorshipConfig> = {}) {
    // Try to load config from localStorage
    const savedConfig = this.loadConfigFromStorage();
    this.config = { ...defaultConfig, ...savedConfig, ...config };

    // Initialize filter with custom settings
    this.filter = new Filter();
    this.filter.addWords(...additionalBadWords);

    // Apply custom words from config
    if (this.config.customWords.length > 0) {
      this.filter.addWords(...this.config.customWords);
    }

    // Remove whitelisted words if allowed
    if (this.config.allowWhitelist && this.config.whitelist.length > 0) {
      this.filter.removeWords(...this.config.whitelist);
    }
  }

  private loadConfigFromStorage(): Partial<CensorshipConfig> {
    try {
      const saved = localStorage.getItem("censorshipConfig");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private detectProfanity(text: string): {
    cleaned: string;
    violations: string[];
  } {
    const violations: string[] = [];

    // Use bad-words library to detect profanity
    const isProfane = this.filter.isProfane(text);

    // Enhanced detection for compound words
    const lowercaseText = text.toLowerCase();
    const badWordsToCheck = [
      "bitch",
      "fuck",
      "shit",
      "damn",
      "ass",
      "dick",
      "cock",
      "pussy",
      "cunt",
      "whore",
      "slut",
      "nigger",
      "faggot",
      "retard",
      "nazi",
      "hitler",
    ];

    let hasCompoundProfanity = false;
    for (const badWord of badWordsToCheck) {
      if (lowercaseText.includes(badWord)) {
        hasCompoundProfanity = true;
        break;
      }
    }

    if (isProfane || hasCompoundProfanity) {
      // Get the actual profane words
      const words = text.split(/\s+/);
      words.forEach((word) => {
        if (this.filter.isProfane(word)) {
          violations.push(word);
        }
      });

      // Check for compound profanity in individual words
      words.forEach((word) => {
        const cleanWord = word.toLowerCase();
        for (const badWord of badWordsToCheck) {
          if (cleanWord.includes(badWord) && !violations.includes(word)) {
            violations.push(word);
          }
        }
      });
    }

    // Clean the text using bad-words library
    const cleaned = this.filter.clean(text);

    return { cleaned, violations };
  }

  private detectSpam(text: string): { cleaned: string; isSpam: boolean } {
    let cleaned = text;
    let isSpam = false;

    spamPatterns.forEach((pattern) => {
      if (pattern.test(text)) {
        isSpam = true;
        cleaned = cleaned.replace(pattern, (match) => {
          if (match.length > 10) {
            return match.substring(0, 3) + "...";
          }
          return match;
        });
      }
    });

    if (text.split("!").length > 5) {
      isSpam = true;
      cleaned = text.replace(/!{2,}/g, "!");
    }

    return { cleaned, isSpam };
  }

  private detectSensitiveContent(text: string): {
    cleaned: string;
    hasSensitive: boolean;
    sensitiveTypes: string[];
  } {
    let cleaned = text;
    let hasSensitive = false;
    const sensitiveTypes: string[] = [];

    const phoneRegex =
      /(\+?1[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g;
    if (phoneRegex.test(text)) {
      hasSensitive = true;
      sensitiveTypes.push("phone");
      cleaned = cleaned.replace(phoneRegex, "[PHONE NUMBER HIDDEN]");
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    if (emailRegex.test(text)) {
      hasSensitive = true;
      sensitiveTypes.push("email");
      cleaned = cleaned.replace(emailRegex, "[EMAIL HIDDEN]");
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(text)) {
      hasSensitive = true;
      sensitiveTypes.push("url");
      cleaned = cleaned.replace(urlRegex, "[LINK HIDDEN]");
    }

    const socialSecurityRegex = /\b\d{3}-?\d{2}-?\d{4}\b/g;
    if (socialSecurityRegex.test(text)) {
      hasSensitive = true;
      sensitiveTypes.push("ssn");
      cleaned = cleaned.replace(socialSecurityRegex, "[SSN HIDDEN]");
    }

    return { cleaned, hasSensitive, sensitiveTypes };
  }

  public censorMessage(text: string): {
    originalText: string;
    censoredText: string;
    violations: string[];
    isSpam: boolean;
    hasSensitiveInfo: boolean;
    sensitiveTypes: string[];
    shouldBlock: boolean;
    warningMessage?: string;
  } {
    if (!text || text.trim().length === 0) {
      return {
        originalText: text,
        censoredText: text,
        violations: [],
        isSpam: false,
        hasSensitiveInfo: false,
        sensitiveTypes: [],
        shouldBlock: false,
      };
    }

    let processedText = text.trim();

    const profanityResult = this.detectProfanity(processedText);
    processedText = profanityResult.cleaned;

    const spamResult = this.detectSpam(processedText);
    processedText = spamResult.cleaned;

    const sensitiveResult = this.detectSensitiveContent(processedText);
    processedText = sensitiveResult.cleaned;

    const shouldBlock =
      this.config.strictMode &&
      (profanityResult.violations.length > 0 ||
        spamResult.isSpam ||
        sensitiveResult.hasSensitive);

    let warningMessage: string | undefined;
    if (profanityResult.violations.length > 0) {
      warningMessage = "Message contained inappropriate language";
    } else if (spamResult.isSpam) {
      warningMessage = "Message appeared to be spam and was modified";
    } else if (sensitiveResult.hasSensitive) {
      warningMessage = "Sensitive information was hidden for privacy";
    }

    return {
      originalText: text,
      censoredText: processedText,
      violations: profanityResult.violations,
      isSpam: spamResult.isSpam,
      hasSensitiveInfo: sensitiveResult.hasSensitive,
      sensitiveTypes: sensitiveResult.sensitiveTypes,
      shouldBlock,
      warningMessage,
    };
  }

  public updateConfig(newConfig: Partial<CensorshipConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Reinitialize filter with new config
    this.filter = new Filter();
    this.filter.addWords(...additionalBadWords);

    if (this.config.customWords.length > 0) {
      this.filter.addWords(...this.config.customWords);
    }

    if (this.config.allowWhitelist && this.config.whitelist.length > 0) {
      this.filter.removeWords(...this.config.whitelist);
    }
  }

  public getConfig(): CensorshipConfig {
    return { ...this.config };
  }
}

export const messageCensor = new MessageCensor();

export const censorText = (text: string) => messageCensor.censorMessage(text);

// Enhanced name validation function using third-party library
export const validateName = (
  name: string,
): {
  isValid: boolean;
  censoredName?: string;
  violations: string[];
  suggestions?: string[];
} => {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      violations: ["empty"],
      suggestions: ["Please enter a name"],
    };
  }

  // Use the third-party filter for better detection
  const tempFilter = new Filter();
  tempFilter.addWords(...additionalBadWords);

  const isProfane = tempFilter.isProfane(name);
  const violations: string[] = [];

  // Enhanced detection for compound words
  const lowercaseName = name.toLowerCase();
  const badWordsToCheck = [
    "bitch",
    "fuck",
    "shit",
    "damn",
    "ass",
    "dick",
    "cock",
    "pussy",
    "cunt",
    "whore",
    "slut",
    "nigger",
    "faggot",
    "retard",
    "nazi",
    "hitler",
  ];

  let hasCompoundProfanity = false;
  for (const badWord of badWordsToCheck) {
    if (lowercaseName.includes(badWord)) {
      hasCompoundProfanity = true;
      break;
    }
  }

  if (isProfane || hasCompoundProfanity) {
    // Find specific violating words
    const words = name.split(/\s+/);
    words.forEach((word) => {
      if (tempFilter.isProfane(word)) {
        violations.push(word);
      }
    });

    // Check for compound profanity in individual words
    words.forEach((word) => {
      const cleanWord = word.toLowerCase();
      for (const badWord of badWordsToCheck) {
        if (cleanWord.includes(badWord) && !violations.includes(word)) {
          violations.push(word);
        }
      }
    });

    // If compound profanity detected but no individual words flagged, add the whole name
    if (hasCompoundProfanity && violations.length === 0) {
      violations.push(name);
    }
  }

  const suggestions: string[] = [];
  if (violations.length > 0) {
    // Generate better suggestions
    const cleanedName = tempFilter.clean(name);
    suggestions.push(`Try: ${cleanedName}`);
    suggestions.push("Use your real name or a nickname");
    suggestions.push("Avoid inappropriate language");
    suggestions.push("Consider using initials");
  }

  return {
    isValid: violations.length === 0,
    censoredName: violations.length > 0 ? tempFilter.clean(name) : name,
    violations,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
};
