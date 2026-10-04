// Extends app.json with values that come from the environment so keys stay out of git.
//   GOOGLE_MAPS_ANDROID_API_KEY  — Maps SDK for Android key (required for the map on Android builds)
//   EAS_PROJECT_ID               — Expo project id (required for device push notifications)
module.exports = ({ config }) => ({
  ...config,
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
