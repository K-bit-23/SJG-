import { TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { MessageCircle } from 'lucide-react-native';

export default function WhatsAppButton() {
  const handlePress = () => {
    // Replace with the actual WhatsApp number
    const phoneNumber = '+1234567890';
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=Hello SJG Textile Hub!`);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <MessageCircle color="#fff" size={24} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#25D366',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
