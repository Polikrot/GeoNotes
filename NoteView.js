import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const NoteView = ({ note, onClose, onEdit, onDelete }) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [editedContent, setEditedContent] = useState(note.content);
  const [isEditing, setIsEditing] = useState(false);

  const handleUnlock = () => {
    if (password === note.password) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Nieprawidłowe hasło');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onEdit(note.id, editedContent);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(note.id);
    onClose();
  };

  return (
    <View style={styles.container}>
      {isUnlocked ? (
        <>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={editedContent}
                onChangeText={setEditedContent}
                multiline
              />
              <Button title="Zapisz" onPress={handleSave} />
            </>
          ) : (
            <>
              <Text style={styles.content}>{note.content}</Text>
              <Button title="Edytuj" onPress={handleEdit} />
            </>
          )}
          <Button title="Usuń" onPress={handleDelete} color="red" />
          <Button title="Zamknij" onPress={onClose} />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Wprowadź hasło"
            secureTextEntry
          />
          <Button title="Odblokuj" onPress={handleUnlock} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  content: {
    fontSize: 16,
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default NoteView;