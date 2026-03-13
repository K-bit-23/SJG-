import { Slot, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { StripeProvider } from '@stripe/stripe-react-native';
import { CartProvider } from '../context/CartContext';
import { tokenCache } from '../utils/cache';
import { useEffect } from 'react';

// Use this for testing if EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not immediately provided by the user
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_Zm91bmQtZ2FyZmllbGQtNzEuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env");
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    }
  }, [isSignedIn, isLoaded, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <StripeProvider publishableKey="pk_test_TYooMQauvdEDq54NiTphI7jx">
        <CartProvider>
          <InitialLayout />
        </CartProvider>
      </StripeProvider>
    </ClerkProvider>
  );
}
