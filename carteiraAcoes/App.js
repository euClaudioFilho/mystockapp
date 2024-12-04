import React from 'react';
import { StyleSheet } from 'react-native';
import MenuNavigator from './src/components/MenuNavigator';

export default function App() {
  return (
    <MenuNavigator />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
