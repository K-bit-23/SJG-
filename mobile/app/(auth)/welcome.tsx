import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { RefreshCcw } from 'lucide-react-native';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top right refresh button */}
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={() => router.replace('/(auth)/welcome')}
      >
        <RefreshCcw size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>SJG Stationery</Text>
        <Text style={styles.subtitle}>Premium Office & School Supplies</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(auth)/options')}>
          <Text style={styles.btnText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d4af37', // Golden color
    justifyContent: 'space-between',
  },
  refreshButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 180,
    height: 180,
    backgroundColor: '#fff',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: 130,
    height: 130,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#111',
    marginTop: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSection: {
    padding: 30,
    paddingBottom: 50,
  },
  btn: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  btnText: {
    color: '#d4af37',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
