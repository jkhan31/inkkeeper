import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const COLORS = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#F5F5F5', '#A8A29E'];

export default function AddBookForm({ bookData, onSave, onCancel }) {
  const [title, setTitle] = useState(bookData?.title || '');
  const [author, setAuthor] = useState(bookData?.authors?.[0] || '');
  const [coverUrl, setCoverUrl] = useState(bookData?.imageLinks?.thumbnail.replace('http://', 'https://') || '');
  const [coverColor, setCoverColor] = useState('');

  const handleSave = () => {
    // In a real app, this would save to Supabase or other storage
    console.log('Saving book:', { title, author, coverUrl, coverColor });
    onSave({ title, author, coverUrl, coverColor });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 20 }}>{bookData ? 'Add this book?' : 'Add book manually'}</ThemedText>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Author"
        value={author}
        onChangeText={setAuthor}
        style={styles.input}
      />
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.coverImage} resizeMode="contain" />
      ) : (
        <View style={{alignItems: 'center'}}>
          <ThemedText style={{marginBottom: 10}}>No cover image. Pick a color:</ThemedText>
          <View style={styles.colorContainer}>
            {COLORS.map(color => (
                <Button key={color} title="" color={color} onPress={() => setCoverColor(color)} />
            ))}
          </View>
          {coverColor ? <ThemedText>Selected: {coverColor}</ThemedText> : null}
        </View>
      )}
      <View style={{height: 20}} />
      <Button title="Add Book" onPress={handleSave} />
      <View style={{height: 10}} />
      <Button title="Cancel" onPress={onCancel} color="red" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: '100%',
    backgroundColor: 'white'
  },
  coverImage: {
    width: 120,
    height: 180,
    alignSelf: 'center',
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  colorContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 15,
  }
});