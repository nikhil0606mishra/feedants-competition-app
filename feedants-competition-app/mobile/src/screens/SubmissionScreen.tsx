import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useSession } from '../context/SessionContext';
import { useSubmitEntry } from '../hooks/useSubmitEntry';
import { Header } from '../components/Header';
import { colors, radius } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Submission'>;

export default function SubmissionScreen({ route, navigation }: Props) {
  const { competitionId } = route.params;
  const { userId } = useSession();
  const submit = useSubmitEntry(competitionId, userId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const urlValid = /^https:\/\/\S+$/i.test(fileUrl.trim());
  const canSubmit = title.trim().length > 0 && urlValid && !submit.isPending;

  const onSubmit = () =>
    submit.mutate(
      { title: title.trim(), description: description.trim() || undefined, fileUrl: fileUrl.trim() },
      {
        onSuccess: () =>
          Alert.alert('Submitted!', 'Your entry has been received. Good luck!', [{ text: 'OK', onPress: () => navigation.goBack() }]),
        onError: (e) => Alert.alert('Could not submit', e.message),
      }
    );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Upload Submission</Text>
          <Text style={styles.hint}>Upload your video to any hosting service, then paste the https link here.</Text>

          <Field label="Title *">
            <TextInput value={title} onChangeText={setTitle} placeholder="Name your entry" style={styles.input} maxLength={150} />
          </Field>
          <Field label="Description">
            <TextInput value={description} onChangeText={setDescription} placeholder="Tell the judges about your piece" style={[styles.input, styles.multiline]} multiline maxLength={1000} />
          </Field>
          <Field label="Video / media link *">
            <TextInput value={fileUrl} onChangeText={setFileUrl} placeholder="https://" autoCapitalize="none" autoCorrect={false} keyboardType="url" style={styles.input} />
            {fileUrl.length > 0 && !urlValid && <Text style={styles.error}>Enter a valid https:// link</Text>}
          </Field>

          <Pressable onPress={onSubmit} disabled={!canSubmit} style={[styles.btn, !canSubmit && styles.btnDisabled]}>
            {submit.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Submit Entry</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 14 },
  heading: { fontSize: 18, fontWeight: '800', color: colors.text },
  hint: { fontSize: 12, color: colors.muted },
  label: { fontSize: 12, fontWeight: '700', color: colors.text },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  error: { fontSize: 11, color: '#B3261E' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  btnDisabled: { backgroundColor: colors.primaryDisabled },
  btnText: { color: colors.white, fontSize: 14, fontWeight: '800' },
});
