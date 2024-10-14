import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Modal, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoteForm from './NoteForm';
import NoteView from './NoteView';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Wczytaj zapisane notatki
      const savedNotes = await loadNotes();
      if (savedNotes) {
        setNotes(savedNotes);
      }
    })();
  }, []);

  const loadNotes = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@notes');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Błąd podczas wczytywania notatek', e);
    }
  };

  const saveNotes = async (notesToSave) => {
    try {
      const jsonValue = JSON.stringify(notesToSave);
      await AsyncStorage.setItem('@notes', jsonValue);
    } catch (e) {
      console.error('Błąd podczas zapisywania notatek', e);
    }
  };

  const addNote = (note) => {
    if (location) {
      const newNote = {
        ...note,
        id: Date.now(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
    }
  };

  const editNote = (id, newContent) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, content: newContent } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleMarkerPress = async (note) => {
    const currentLocation = await Location.getCurrentPositionAsync({});
    const distance = calculateDistance(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      note.latitude,
      note.longitude
    );

    if (distance <= 0.1) { // 100 metrów
      setSelectedNote(note);
    } else {
      Alert.alert('Za daleko', 'Musisz być bliżej notatki, aby ją odblokować.');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Promień Ziemi w kilometrach
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Odległość w kilometrach
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
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
              <Marker
                key={note.id}
                coordinate={{ latitude: note.latitude, longitude: note.longitude }}
                title="Notatka"
                onPress={() => handleMarkerPress(note)}
              />
            ))}
          </MapView>
        ) : (
          <Text>{errorMsg || 'Ładowanie...'}</Text>
        )}
      </View>
      <ScrollView style={styles.formContainer}>
        <NoteForm onSubmit={addNote} />
      </ScrollView>
      <Modal
        visible={selectedNote !== null}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalView}>
          {selectedNote && (
            <NoteView
              note={selectedNote}
              onClose={() => setSelectedNote(null)}
              onEdit={editNote}
              onDelete={deleteNote}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  mapContainer: {
    flex: 2,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: -20,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});