// app/index.tsx
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from '../firebase';

function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          // No user - navigate after interactions complete
        
            router.replace('/step1');
            setLoading(false);
 
          return;
        }
        router.replace("/(tabs)/(group)/group")
        
      } catch (error) {
        console.error('Error in auth check:', error);
       
          router.replace('/step1');
          setLoading(false);
  
      }
    });

    // Cleanup listener
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return null;
}

export default Index;
