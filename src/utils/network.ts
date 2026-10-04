import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

/** Shown whenever the device itself has no internet. */
export const NO_INTERNET_MESSAGE = "No internet connection. Please check your internet connection and try again.";
/** Shown when the device is online but our server can't be reached. */
export const SERVER_UNREACHABLE_MESSAGE = "We couldn't reach Temple Connect right now. Please try again in a moment.";

let lastKnownOnline = true;

function isOnline(state: NetInfoState): boolean {
  // isInternetReachable is null while unknown — treat unknown as online to avoid false alarms.
  return !!state.isConnected && state.isInternetReachable !== false;
}

NetInfo.addEventListener((state) => {
  lastKnownOnline = isOnline(state);
});

/** Best current guess of connectivity without waiting (kept up to date by the listener above). */
export function isProbablyOnline(): boolean {
  return lastKnownOnline;
}

/** Fresh connectivity check. */
export async function checkOnline(): Promise<boolean> {
  try {
    lastKnownOnline = isOnline(await NetInfo.fetch());
  } catch {}
  return lastKnownOnline;
}

export { isOnline };
