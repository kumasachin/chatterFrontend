export interface User {
  _id: string;
  name: string;
  fullName?: string;
  email?: string;
  isEmailVerified?: boolean;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  profile?: string;
  friends?: string[];
  isGuest?: boolean;
  isAIBot?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface UserState {
  currentUser?: User;
  setCurrentUser: (user: User) => void;
  currentRecipient: User | null;
  setCurrentRecipient: (user: User | null) => void;
  resetCurrentUser: () => void;
}

export interface AuthStore {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
}

export interface LoginData {
  name: string;
  password: string;
}

export interface SignupData {
  name: string;
  password: string;
  profile?: string;
  fullName?: string;
  email?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
}

export interface UpdateProfileData {
  name?: string;
  profile?: string;
}

export interface UpdateUserInfoData {
  fullName?: string;
  email?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
}
