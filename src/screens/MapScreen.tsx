import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { colors, spacing } from "../theme";
import { getMapTemples, MapTemple } from "../api/admin";
import { getErrorMessage } from "../api/client";

export default function MapScreen({ route, navigation }: any) {
  const focus: { lat?: number; lng?: number; name?: string } = route.params ?? {};
  const hasFocus = typeof focus.lat === "number" && typeof focus.lng === "number";
  const [temples, setTemples] = useState<MapTemple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMapTemples(hasFocus ? { lat: focus.lat, lng: focus.lng } : undefined);
        setTemples(data);
        // Only zoom out to show everything when we're not focused on a specific temple.
        if (!hasFocus && data.length > 0) {
          setTimeout(() => mapRef.current?.fitToCoordinates(
            data.map((t) => ({ latitude: t.lat, longitude: t.lng })),
            { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true }
          ), 300);
        }
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialRegion = {
    latitude: hasFocus ? focus.lat! : 20.5937,
    longitude: hasFocus ? focus.lng! : 78.9629,
    latitudeDelta: hasFocus ? 0.05 : 20,
    longitudeDelta: hasFocus ? 0.05 : 20,
  };

  const focusIsListed = hasFocus && temples.some((t) => Math.abs(t.lat - focus.lat!) < 1e-4 && Math.abs(t.lng - focus.lng!) < 1e-4);

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={initialRegion} showsUserLocation>
        {hasFocus && !focusIsListed && (
          <Marker coordinate={{ latitude: focus.lat!, longitude: focus.lng! }} title={focus.name} pinColor={colors.primary} />
        )}
        {temples.map((t) => (
          <Marker
            key={t.id}
            coordinate={{ latitude: t.lat, longitude: t.lng }}
            title={t.name}
            description={[t.city, t.state].filter(Boolean).join(", ")}
            pinColor={hasFocus && Math.abs(t.lat - focus.lat!) < 1e-4 ? colors.primary : undefined}
            onCalloutPress={() => navigation.navigate("TempleDetail", { temple: { name: t.name, placeId: t.id, city: t.city, state: t.state } })}
          />
        ))}
      </MapView>
      {loading && <ActivityIndicator style={styles.overlay} color={colors.primary} />}
      {error && <Text style={[styles.overlay, styles.error]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  overlay: { position: "absolute", top: spacing.md, alignSelf: "center" },
  error: { backgroundColor: colors.card, color: colors.danger, padding: spacing.sm, borderRadius: 8, overflow: "hidden" },
});
