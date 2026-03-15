import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function Options() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.title}>Join Us</Text>
        <Text style={styles.subtitle}>Select an option to continue</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/(auth)/signin')}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.signUpButton} onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.signUpText}>Create an Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  signInButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInText: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signUpText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  guestText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
