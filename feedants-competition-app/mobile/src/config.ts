// EXPO_PUBLIC_* variables are inlined at build time by Expo.
export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000',
  demoCompetitionId: process.env.EXPO_PUBLIC_DEMO_COMPETITION_ID ?? '',
  demoUserId: process.env.EXPO_PUBLIC_DEMO_USER_ID ?? '',
};
