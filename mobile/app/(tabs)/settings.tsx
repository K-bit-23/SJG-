import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Image, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Lock, Eye, CircleHelp, Globe, Smartphone, MapPin, User, ShieldCheck, Fingerprint, Save, LogOut, Layers as LayersIcon, MousePointer2, Settings as SettingsIcon } from 'lucide-react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { auth as firebaseAuth } from '../../utils/firebaseConfig';
import api from '../../utils/api';

export default function Settings() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [bioAuthEnabled, setBioAuthEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [floatingEnabled, setFloatingEnabled] = useState(false);
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('Not available');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string>('ExponentPushToken[...]');
  const [deviceInfo] = useState({
    brand: Device.brand,
    model: Device.modelName,
    os: Device.osName,
    version: Device.osVersion,
    isDevice: Device.isDevice,
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    // Instant UI: Don't block the whole screen for the backend sync
    setLoading(false);
    
    try {
      // 1. Try to load from Local Storage first
      const stored = await SecureStore.getItemAsync('user_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPushEnabled(parsed.pushEnabled ?? true);
        setEmailEnabled(parsed.emailEnabled ?? false);
        setDarkMode(parsed.darkMode ?? false);
        setBioAuthEnabled(parsed.bioAuthEnabled ?? false);
        setLocationEnabled(parsed.locationEnabled ?? false);
        setFloatingEnabled(parsed.floatingEnabled ?? false);
        setOverlayEnabled(parsed.overlayEnabled ?? false);
        
        if (parsed.locationEnabled) {
          handleLocationToggle(true);
        }
        
        // Optimistic UI: stop loading as soon as local data is available
        setLoading(false);
      }
      
      // 2. Sync with DB if logged in
      if (user?.primaryEmailAddress?.emailAddress) {
        try {
          const res = await api.get(`/profile/${user.primaryEmailAddress.emailAddress}/`);
          if (res.data && res.data.appSettings) {
             const dbSettings = res.data.appSettings;
             setPushEnabled(dbSettings.notifications ?? true);
             setEmailEnabled(dbSettings.emailUpdates ?? false);
             setDarkMode(dbSettings.darkMode ?? false);
             setBioAuthEnabled(dbSettings.bioAuth ?? false); 
             setLocationEnabled(dbSettings.locationAccess ?? false);
             setFloatingEnabled(dbSettings.floatingShortcut ?? false);
             setOverlayEnabled(dbSettings.overlayMode ?? false);
             
             // Update local storage to match DB
             const localSync = {
               pushEnabled: dbSettings.notifications,
               emailEnabled: dbSettings.emailUpdates,
               darkMode: dbSettings.darkMode,
               bioAuthEnabled: dbSettings.bioAuth,
               locationEnabled: dbSettings.locationAccess,
               floatingEnabled: dbSettings.floatingShortcut,
               overlayEnabled: dbSettings.overlayMode
             };
             await SecureStore.setItemAsync('user_settings', JSON.stringify(localSync));
          }
        } catch (e) {
          console.log("DB sync fallback - no profile yet");
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      // Ensure loading is false even if no local data
      setLoading(false);
    }
  };

  const handlePushToggle = (value: boolean) => {
    setPushEnabled(value);
    if (value) {
      Alert.alert("Notifications Enabled", "You will now receive updates about your orders and new products.");
    }
  };

  const handleOverlayToggle = async (value: boolean) => {
    setOverlayEnabled(value);
    if (value && Platform.OS === 'android') {
      Alert.alert(
        "Permission Required",
        "To enable 'Display Over Apps', you must grant permission in system settings.",
        [
          { text: "Cancel", onPress: () => setOverlayEnabled(false), style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      );
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    const settings = {
      pushEnabled,
      emailEnabled,
      darkMode,
      bioAuthEnabled,
      locationEnabled,
      floatingEnabled,
      overlayEnabled
    };

    try {
      // 1. Save to Local Storage (SecureStore)
      await SecureStore.setItemAsync('user_settings', JSON.stringify(settings));

      // 2. Save to DB
      if (user?.primaryEmailAddress?.emailAddress) {
        await api.post(`/profile/${user.primaryEmailAddress.emailAddress}/`, {
          email: user.primaryEmailAddress.emailAddress,
          fullName: user.fullName,
          appSettings: {
            notifications: pushEnabled,
            emailUpdates: emailEnabled,
            darkMode: darkMode,
            bioAuth: bioAuthEnabled, 
            locationAccess: locationEnabled,
            floatingShortcut: floatingEnabled,
            overlayMode: overlayEnabled
          }
        });
      }
      
      Alert.alert('Success', 'Settings saved and synced successfully!');
    } catch (err) {
      console.error("Failed to save settings:", err);
      Alert.alert('Error', 'Failed to save settings to cloud');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Sign out from Clerk
              await signOut();
              
              // 2. Sign out from Firebase if authenticated
              if (firebaseAuth.currentUser && typeof firebaseAuth.signOut === 'function') {
                await firebaseAuth.signOut();
              }
              
              // 3. Explicitly move to welcome page
              router.replace('/(auth)/welcome');
            } catch (err) {
              console.error("Sign out failed", err);
              // Fallback redirect anyway
              router.replace('/(auth)/welcome');
            }
          }
        }
      ]
    );
  };

  const handleLocationToggle = async (value: boolean) => {
    setLocationEnabled(value);
    if (value) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature');
        setLocationEnabled(false);
        return;
      }
      try {
        let loc = await Location.getCurrentPositionAsync({});
        let reverse = await Location.reverseGeocodeAsync(loc.coords);
        if (reverse.length > 0) {
          setCurrentLocation(`${reverse[0].city}, ${reverse[0].region}`);
        }
      } catch (e) {
        setCurrentLocation('Location unavailable');
      }
    } else {
      setCurrentLocation('Not available');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeftRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings Hub</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.profileCircle}
          onPress={() => router.push('/(tabs)/profile')}
        >
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.profileImg} />
          ) : (
            <User size={20} color="#0a7ea4" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell size={20} color="#666" />
              <Text style={styles.rowText}>Push Notifications</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handlePushToggle}
              trackColor={{ false: '#d1d5db', true: '#d4af37' }}
              thumbColor={pushEnabled ? '#fff' : '#fff'}
            />
          </View>
          
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Smartphone size={20} color="#666" />
              <Text style={styles.rowText}>Email Promos</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#d1d5db', true: '#d4af37' }}
              thumbColor={emailEnabled ? '#fff' : '#fff'}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Eye size={20} color="#666" />
              <Text style={styles.rowText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#d1d5db', true: '#111' }}
              thumbColor={darkMode ? '#fff' : '#fff'}
            />
          </View>

          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={styles.rowLeft}>
              <Fingerprint size={20} color="#666" />
              <Text style={styles.rowText}>Biometric Login</Text>
            </View>
            <Switch
              value={bioAuthEnabled}
              onValueChange={setBioAuthEnabled}
              trackColor={{ false: '#d1d5db', true: '#0a7ea4' }}
              thumbColor={bioAuthEnabled ? '#fff' : '#fff'}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Advanced Features</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MousePointer2 size={20} color="#666" />
              <Text style={styles.rowText}>Floating Shortcut</Text>
            </View>
            <Switch
              value={floatingEnabled}
              onValueChange={setFloatingEnabled}
              trackColor={{ false: '#d1d5db', true: '#d4af37' }}
              thumbColor={floatingEnabled ? '#fff' : '#fff'}
            />
          </View>
          
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={styles.rowLeft}>
              <LayersIcon size={20} color="#666" />
              <Text style={styles.rowText}>Display Over Apps</Text>
            </View>
            <Switch
              value={overlayEnabled}
              onValueChange={handleOverlayToggle}
              trackColor={{ false: '#d1d5db', true: '#d4af37' }}
              thumbColor={overlayEnabled ? '#fff' : '#fff'}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Location Services</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MapPin size={20} color="#666" />
              <Text style={styles.rowText}>Share Location</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: '#d1d5db', true: '#16a34a' }}
              thumbColor={locationEnabled ? '#fff' : '#fff'}
            />
          </View>
          {locationEnabled && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Area:</Text>
              <Text style={styles.detailValue}>{currentLocation}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Account & Security</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Lock size={20} color="#666" />
              <Text style={styles.rowText}>Privacy & Security</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Globe size={20} color="#666" />
              <Text style={styles.rowText}>Language</Text>
            </View>
            <Text style={styles.rowValue}>English</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={() => router.push('/contact')}>
            <View style={styles.rowLeft}>
              <CircleHelp size={20} color="#666" />
              <Text style={styles.rowText}>Help & Support</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && { opacity: 0.7 }]} 
          onPress={saveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Save size={20} color="#000" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#ff3b30" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Device Diagnostics Section */}
        <View style={styles.diagnosticsCard}>
          <Text style={styles.diagnosticsTitle}>Device Diagnostics</Text>
          <View style={styles.diagRow}>
            <Smartphone size={14} color="#6b7280" />
            <Text style={styles.diagText}>{deviceInfo.brand} {deviceInfo.model} ({deviceInfo.os} {deviceInfo.version})</Text>
          </View>
          <View style={styles.diagRow}>
            <Bell size={14} color="#6b7280" />
            <Text style={styles.diagText}>Push Token: {expoPushToken ? 'Active' : 'Missing'}</Text>
          </View>
          <View style={styles.diagRow}>
            <MapPin size={14} color="#6b7280" />
            <Text style={styles.diagText}>Location: {locationEnabled ? 'Enabled' : 'Disabled'}</Text>
          </View>
          <View style={styles.diagRow}>
            <LayersIcon size={14} color="#6b7280" />
            <Text style={styles.diagText}>Overlay Service: {overlayEnabled ? 'Active' : 'Standby'}</Text>
          </View>
          <Text style={styles.buildInfo}>Version: {Constants.expoConfig?.version || '1.0.0'} • Build: Dev</Text>
        </View>
        
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#fff', 
    paddingTop: 60, 
    paddingBottom: 15, 
    paddingHorizontal: 20, 
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 3, zIndex: 10 
  },
  headerLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileImg: { width: '100%', height: '100%' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10, marginTop: 15 },
  section: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 16, color: '#1f2937' },
  rowValue: { fontSize: 14, color: '#6b7280' },
  detailRow: { padding: 16, backgroundColor: '#f9fafb', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  detailLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
  detailValue: { fontSize: 14, color: '#111', fontWeight: 'bold' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d4af37',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 30,
    gap: 10,
    shadowColor: '#d4af37',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 15,
    gap: 10,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  signOutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: 'bold',
  },
  diagnosticsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  diagnosticsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diagText: {
    fontSize: 13,
    color: '#4b5563',
  },
  buildInfo: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
});

