export type Auth = {
  name: string;
  email: string;
  accessToken: string;
  isAuthenticated?: boolean; // added by AuthProvider
};

