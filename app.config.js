// Extends app.json with values that come from the environment so keys stay out of git.
//   GOOGLE_MAPS_ANDROID_API_KEY  — Maps SDK for Android key (required for the map on Android builds)
//   EAS_PROJECT_ID               — Expo project id (required for device push notifications)
//   GOOGLE_IOS_URL_SCHEME        — "Reversed client ID" of the iOS OAuth client (com.googleusercontent.apps.xxxx),
//                                  required for "Continue with Google" on iOS
const googleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    googleIosUrlScheme
      ? ["@react-native-google-signin/google-signin", { iosUrlScheme: googleIosUrlScheme }]
      : "@react-native-google-signin/google-signin",
  ],
  android: {
    ...config.android,
    config: {
      ...(config.android?.config ?? {}),
      googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? "" },
    },
  },
  extra: {
    ...(config.extra ?? {}),
    eas: process.env.EAS_PROJECT_ID ? { projectId: process.env.EAS_PROJECT_ID } : undefined,
  },
});
