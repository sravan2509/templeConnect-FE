import { useEffect, useState, useRef } from "react";
import { ScrollView, StyleSheet, Text, View, Platform, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { getMapTemples, MapTemple } from "../api/admin";

export default function MapScreen({ route }: any) {
  const [temples, setTemples] = useState<MapTemple[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      try { 
        const data = await getMapTemples();
        setTemples(data);
        if (data.length > 0 && mapRef.current) {
          mapRef.current.fitToCoordinates(
            data.map(t => ({ latitude: t.lat, longitude: t.lng })),
            { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }
          );
        }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  // Use route params to center map if navigated from a specific temple
  const initialRegion = {
    latitude: route.params?.lat || 20.5937,
    longitude: route.params?.lng || 78.9629,
    latitudeDelta: route.params?.lat ? 0.05 : 15,
    longitudeDelta: route.params?.lng ? 0.05 : 15,
  };

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
        >
          {temples.map((t) => (
            <Marker
              key={t.id}
              coordinate={{ latitude: t.lat, longitude: t.lng }}
              title={t.name}
              description={`${t.city}, ${t.state}`}
            />
          ))}
        </MapView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  }
});
