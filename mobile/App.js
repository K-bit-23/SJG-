import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { RootNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
    </AuthProvider>
  );
}
