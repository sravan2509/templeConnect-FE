import Constants, { ExecutionEnvironment } from "expo-constants";

/**
 * "Continue with Google" via the native Google Sign-In SDK.
 * The native module isn't in Expo Go, so it's loaded lazily and only in development/production builds.
 *
 * Config (app .env):
 *   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID  — Web OAuth client ID (used to mint the ID token the server verifies)
 *   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID  — iOS OAuth client ID
 */
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type GoogleModule = typeof import("@react-native-google-signin/google-signin");
let mod: GoogleModule | null = null;
let configured = false;

function load(): GoogleModule | null {
  if (isExpoGo || !webClientId) return null;
  if (!mod) {
    try {
      mod = require("@react-native-google-signin/google-signin") as GoogleModule;
    } catch {
      return null;
    }
  }
  if (!configured) {
    mod.GoogleSignin.configure({ webClientId, iosClientId, scopes: ["profile", "email"] });
    configured = true;
  }
  return mod;
}

/** Why Google sign-in can't be offered on this build, or null when it can. */
export function googleUnavailableReason(): string | null {
  if (isExpoGo) return "Google sign-in is available in the installed app (not in Expo Go).";
  if (!webClientId) return "Google sign-in isn't configured yet.";
  return null;
}

export class GoogleSignInCancelled extends Error {}

/** Opens the Google account picker and returns an ID token for the server to verify. */
export async function getGoogleIdToken(): Promise<string> {
  const m = load();
  if (!m) throw new Error(googleUnavailableReason() ?? "Google sign-in is unavailable");
  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = m;
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Show the account picker every time so people can choose which Google account to use.
    await GoogleSignin.signOut().catch(() => {});
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) throw new GoogleSignInCancelled();
    const idToken = response.data.idToken;
    if (!idToken) throw new Error("Google didn't return a sign-in token. Please try again.");
    return idToken;
  } catch (err: any) {
    if (err instanceof GoogleSignInCancelled) throw err;
    if (isErrorWithCode(err)) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) throw new GoogleSignInCancelled();
      if (err.code === statusCodes.IN_PROGRESS) throw new GoogleSignInCancelled();
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services is not available or needs an update on this device.");
      }
    }
    throw new Error(err?.message || "Google sign-in failed. Please try again.");
  }
}

/** Clears the native Google session so the next sign-in shows the account picker. */
export async function signOutGoogle(): Promise<void> {
  const m = load();
  if (!m) return;
  try { await m.GoogleSignin.signOut(); } catch {}
}
