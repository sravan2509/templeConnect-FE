import { useState, useCallback } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { colors, spacing, radius } from "../../theme";
import { getPriestProfile, updatePriestProfile, listPujas, Puja } from "../../api/admin";
import { changePassword } from "../../api/auth";
import { getErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function PriestProfileScreen() {
  const { user, updateSession, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lang, setLang] = useState("");
  const [bio, setBio] = useState("");
  const [selectedPujas, setSelectedPujas] = useState<string[]>([]);

  const [changingPassword, setChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadData = useCallback(async () => {
    try { setPujas(await listPujas()); } catch {}
    try {
      const p = await getPriestProfile();
      setProfile(p);
      setName(p.name); setPhone(p.phone || ""); setLang(p.languages || ""); setBio(p.bio || "");
      setSelectedPujas(p.priestPujas?.map((pp: any) => pp.pujaId) || []);
    } catch (e) {
      Alert.alert("Error", getErrorMessage(e));
    }
  }, []);

  useFocusEffect(useCallback(() => { if (!editing) loadData(); }, [loadData, editing]));

  async function handleSaveProfile() {
    if (!name.trim()) return Alert.alert("Name required", "Please enter your name.");
    setSaving(true);
    try {
      await updatePriestProfile({ name: name.trim(), phone: phone.trim(), languages: lang.trim(), bio: bio.trim(), pujaIds: selectedPujas });
      if (user && name.trim() !== user.name) await updateSession({ ...user, name: name.trim() });
      Alert.alert("Saved", "Profile updated");
      setEditing(false);
      loadData();
    } catch (e) { Alert.alert("Error", getErrorMessage(e)); }
    finally { setSaving(false); }
  }

  async function handleChangePassword() {
    if (!oldPassword || !newPassword) return Alert.alert("Error", "Please enter your current and new passwords");
    if (newPassword.length < 8) return Alert.alert("Error", "New password must be at least 8 characters");
    if (newPassword !== confirmPassword) return Alert.alert("Error", "New passwords do not match");
    setSaving(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      await updateSession(res.user, res.token);
      Alert.alert("Success", "Password updated. Other devices have been signed out.");
      setChangingPassword(false);
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e) {
      Alert.alert("Error", getErrorMessage(e));
    } finally { setSaving(false); }
  }

  function togglePuja(id: string) {
    setSelectedPujas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <Screen safeTop>
      {profile && (
        <Card style={styles.profileCard}>
          <Text style={styles.name}>{profile.verified ? "✅ " : ""}{profile.name}</Text>
          <Text style={styles.sub}>⭐ {profile.rating?.toFixed(1)} · {profile.reviewCount} reviews · {profile.experienceYears} yrs</Text>
          {profile.qualifications ? <Text style={styles.sub}>{profile.qualifications}</Text> : null}
          {profile.languages ? <Text style={styles.sub}>🗣 {profile.languages}</Text> : null}
          <Text style={styles.sub}>Pujas: {profile.priestPujas?.map((pp: any) => pp.puja.name).join(", ") || "None selected"}</Text>
        </Card>
      )}

      <View style={styles.btnRow}>
        <Button title={editing ? "Cancel" : "✏️ Edit Profile"} onPress={() => { setEditing(!editing); setChangingPassword(false); }}
          variant={editing ? "secondary" : "primary"} style={{ flex: 1 }} />
        <Button title={changingPassword ? "Cancel" : "🔑 Password"} onPress={() => { setChangingPassword(!changingPassword); setEditing(false); }}
          variant={changingPassword ? "secondary" : "primary"} style={{ flex: 1 }} />
      </View>

      {changingPassword && (
        <Card>
          <TextField label="Current Password" value={oldPassword} onChangeText={setOldPassword} secureTextEntry />
          <TextField label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="At least 8 characters" />
          <TextField label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          <Button title="Update Password" onPress={handleChangePassword} loading={saving} />
        </Card>
      )}

      {editing && (
        <Card>
          <TextField label="Name" value={name} onChangeText={setName} />
          <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextField label="Languages" value={lang} onChangeText={setLang} placeholder="Hindi, Telugu, English" />
          <TextField label="Bio" value={bio} onChangeText={setBio} multiline style={{ minHeight: 80, textAlignVertical: "top" }} />
          <Text style={styles.label}>Pujas I perform</Text>
          <View style={styles.chipWrap}>
            {pujas.map((p) => {
              const on = selectedPujas.includes(p.id);
              return (
                <TouchableOpacity key={p.id} style={[styles.chip, on && styles.chipActive]} onPress={() => togglePuja(p.id)}>
                  <Text style={[styles.chipText, on && styles.chipTextActive]}>{p.icon} {p.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Button title="Save Profile" onPress={handleSaveProfile} loading={saving} style={{ marginTop: spacing.sm }} />
        </Card>
      )}

      <Button title="Log Out" variant="secondary" onPress={() => Alert.alert("Log out?", "You'll need to sign in again to use the app.", [{ text: "Cancel", style: "cancel" }, { text: "Log Out", style: "destructive", onPress: signOut }])} style={{ marginTop: spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: "center", paddingVertical: spacing.lg, marginTop: spacing.md },
  name: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: spacing.xs, textAlign: "center" },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2, textAlign: "center" },
  btnRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 2, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12 },
  chipTextActive: { color: "#fff", fontWeight: "700" },
});
