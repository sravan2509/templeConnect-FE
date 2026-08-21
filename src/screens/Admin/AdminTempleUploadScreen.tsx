import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { colors, spacing, radius } from "../../theme";
import { downloadTempleTemplate, uploadTemplesFile, listAllDBTemples, deleteDBTemple } from "../../api/admin";

export default function AdminTempleUploadScreen() {
  const [temples, setTemples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchTemples = async () => {
    setLoading(true);
    try {
      const data = await listAllDBTemples();
      setTemples(data);
    } catch (e) {
      Alert.alert("Error", "Could not fetch temples from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemples();
  }, []);

  const handleDownloadTemplate = async () => {
    Alert.alert(
      "Template Requirements",
      "The Excel/CSV template has the following columns:\n\n" +
      "• Serial Number (Optional)\n" +
      "• Temple Name (Required)\n" +
      "• Deity Name (Optional)\n" +
      "• Address (Optional, used for City/State extraction)\n" +
      "• Latitude (Optional)\n" +
      "• Longitude (Optional)\n" +
      "• Contact Details (Optional)\n" +
      "• Temple History (Optional)\n" +
      "• Significance (Optional)\n" +
      "• Sevas (Optional)\n" +
      "• Website Link (Optional)\n\n" +
      "Note: 'Temple Name' and 'Deity Name' are separate so users can search by deity (e.g. Temple: Arunachalam, Deity: Shiva).\n\n" +
      "Do you want to download the template?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Download", 
          onPress: async () => {
            try {
              const url = await downloadTempleTemplate();
              Linking.openURL(url);
            } catch (e) {
              Alert.alert("Error", "Could not download template.");
            }
          }
        }
      ]
    );
  };

  const handleUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"],
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;

      const file = res.assets[0];
      setUploading(true);

      const formDataFile: any = {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream"
      };

      const result = await uploadTemplesFile(formDataFile);
      Alert.alert("Upload Success", `Created: ${result.created}\nUpdated: ${result.updated}\nErrors: ${result.errors?.length || 0}`);
      fetchTemples();
    } catch (e: any) {
      Alert.alert("Upload Failed", e?.message || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Temple", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await deleteDBTemple(id);
          fetchTemples();
        } catch {
          Alert.alert("Error", "Could not delete temple.");
        }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
          <Text style={styles.deleteBtn}>Delete</Text>
        </TouchableOpacity>
      </View>
      {item.deityName && <Text style={styles.sub}>Deity: {item.deityName}</Text>}
      {item.city && <Text style={styles.sub}>Location: {item.city}, {item.state}</Text>}
      <Text style={styles.sub}>ID: {item.placeId}</Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Temple Database</Text>
      </View>

      <View style={styles.actionArea}>
        <Text style={styles.desc}>Upload an Excel or CSV file to update the temple database.</Text>
        <View style={styles.btnRow}>
          <Button title="Download Template" variant="secondary" onPress={handleDownloadTemplate} style={styles.flexBtn} />
          <Button title="Upload File" onPress={handleUpload} loading={uploading} style={styles.flexBtn} />
        </View>
      </View>

      <View style={{ marginHorizontal: spacing.md }}>
        <SectionHeader title="Database Entries" />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={temples}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No temples in database.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  headerTitle: { color: colors.primary, fontSize: 18, fontWeight: "700" },
  actionArea: { padding: spacing.md },
  desc: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
  btnRow: { flexDirection: "row", gap: spacing.sm },
  flexBtn: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  card: { marginBottom: spacing.sm },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "700", flex: 1 },
  deleteBtn: { color: colors.danger, fontSize: 13, fontWeight: "600", marginLeft: spacing.sm },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl }
});
