import React, { useState, useCallback } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { colors, spacing, radius } from "../../theme";
import { getPriestProfile, updatePriestProfile, listPujas } from "../../api/admin";
import { changePassword } from "../../api/auth";
import { getErrorMessage } from "../../api/client";

export default function PriestProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [pujas, setPujas] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lang, setLang] = useState("");
  const [bio, setBio] = useState("");
  const [selectedPujas, setSelectedPujas] = useState<string[]>([]);
  
  const [changingPassword, setChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try { setPujas(await listPujas()); } catch {}
    try {
      const p = await getPriestProfile(); setProfile(p);
      setName(p.name); setPhone(p.phone || ""); setLang(p.languages); setBio(p.bio || "");
      setSelectedPujas(p.priestPujas?.map((pp: any) => pp.pujaId) || []);
    } catch {}
  }

  async function handleSaveProfile() {
    try {
      await updatePriestProfile({ name, phone, languages: lang, bio, pujaIds: selectedPujas });
      Alert.alert("Saved", "Profile updated");
      setEditing(false);
      loadData();
    } catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }

  async function handleChangePassword() {
    if (!oldPassword || !newPassword) {
      Alert.alert("Error", "Please enter both old and new passwords");
      return;
    }
    try {
      await changePassword(oldPassword, newPassword);
      Alert.alert("Success", "Password updated successfully");
      setChangingPassword(false);
      setOldPassword("");
      setNewPassword("");
    } catch (e: any) {
      Alert.alert("Error", getErrorMessage(e));
    }
  }

  function togglePuja(id: string) {
    setSelectedPujas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <Screen safeTop>
      <ScrollView showsVerticalScrollIndicator={false}>
        {profile && (
          <Card style={styles.profileCard}>
            <Text style={styles.name}>{profile.verified ? "✅ " : ""}{profile.name}</Text>
            <Text style={styles.sub}>⭐{profile.rating} · {profile.reviewCount} reviews · {profile.experienceYears} yrs</Text>
            <Text style={styles.sub}>{profile.qualifications}</Text>
          </Card>
        )}

        <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.md }}>
          <Button title={editing ? "Cancel" : "✏️ Edit Profile"} onPress={() => { setEditing(!editing); setChangingPassword(false); }}
            variant={editing ? "secondary" : "primary"} style={{ flex: 1 }} />
          <Button title={changingPassword ? "Cancel" : "🔑 Change Password"} onPress={() => { setChangingPassword(!changingPassword); setEditing(false); }}
            variant={changingPassword ? "secondary" : "primary"} style={{ flex: 1 }} />
        </View>

        {changingPassword && (
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={styles.label}>Old Password</Text>
            <TextInput style={styles.input} value={oldPassword} onChangeText={setOldPassword} secureTextEntry />
            <Text style={styles.label}>New Password</Text>
            <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
            <Button title="Update Password" onPress={handleChangePassword} style={{ marginTop: spacing.sm }} />
          </Card>
        )}

        {editing && (
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} />
            <Text style={styles.label}>Languages</Text>
            <TextInput style={styles.input} value={lang} onChangeText={setLang} />
            <Text style={styles.label}>Bio</Text>
            <TextInput style={styles.input} value={bio} onChangeText={setBio} multiline />
            <Text style={styles.label}>My Pujas</Text>
            <View style={styles.chipWrap}>
              {pujas.map(p => (
                <TouchableOpacity key={p.id} style={[styles.chip, selectedPujas.includes(p.id) && styles.chipActive]}
                  onPress={() => togglePuja(p.id)}>
                  <Text style={[styles.chipText, selectedPujas.includes(p.id) && styles.chipTextActive]}>{p.icon} {p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Save Profile" onPress={handleSaveProfile} style={{ marginTop: spacing.sm }} />
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: "center", padding: spacing.lg },
  name: { color: colors.text, fontSize: 18, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  label: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm, marginBottom: 2 },
  input: { backgroundColor: colors.cardAlt, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, color: colors.text, padding: spacing.sm, fontSize: 14 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 11 },
  chipTextActive: { color: "#fff" },
});
