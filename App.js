import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import NoteView from './NoteView';

// Warunkowy import MapView
let MapView;
if (Platform.OS === 'web') {
  MapView = require('react-native-web-maps').default;
} else {
  MapView = require('react-native-maps').default;
}

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        // Dla wersji webowej używamy geolokalizacji przeglądarki
        navigator.geolocation.getCurrentPosition(
          position => {
            setLocation({
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }
            });
          },
          error => {
            setErrorMsg('Error getting location: ' + error.message);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      } else {
        // Dla wersji mobilnej używamy expo-location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }
    })();
  }, []);

  const addNote = (note) => {
    if (location) {
      const newNote = {
        ...note,
        id: Date.now(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setNotes([...notes, newNote]);
    }
  };

  const handleMarkerPress = (note) => {
    setSelectedNote(note);
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {notes.map((note) => (
            <MapView.Marker
              key={note.id}
              coordinate={{ latitude: note.latitude, longitude: note.longitude }}
              title={note.title}
              description={note.content}
              onPress={() => handleMarkerPress(note)}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.centerContent}>
          <Text>{errorMsg || 'Loading map...'}</Text>
        </View>
      )}
      {selectedNote && (
        <NoteView
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});