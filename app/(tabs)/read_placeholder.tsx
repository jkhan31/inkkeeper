// Filename: app/(tabs)/read_placeholder.tsx
// Purpose: A dummy component required by Expo Router for the "Read" tab.
// Note: We never actually see this screen because the _layout.tsx listener 
// intercepts the press and redirects to '/log-session' instead.

import { View } from 'react-native';

export default function Placeholder() {
  return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
}