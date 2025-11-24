// components/ui/AddBookForm.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { ThemedText } from '../themed-text'; // Assuming these are in a 'components' folder
import { ThemedView } from '../themed-view'; // Assuming these are in a 'components' folder
import { supabase } from '../../lib/supabase'; // Adjust path if necessary
import { MaterialCommunityIcons } from '@expo/vector-icons'; // For icons like 'book' or 'headphones'

interface BookData {
  title: string;
  authors?: string[];
  imageLinks?: {
    thumbnail: string;
  };
  pageCount?: number;
  // Add other properties from Google Books API as needed
}

interface AddBookFormProps {
  bookData: BookData;
  onClose: () => void;
  onBookAdded: () => void; // Callback to refresh list in parent
}

export default function AddBookForm({ bookData, onClose, onBookAdded }: AddBookFormProps) {
  const [totalPages, setTotalPages] = useState<string>(bookData.pageCount ? String(bookData.pageCount) : '');
  const [format, setFormat] = useState<'Physical' | 'Audio'>('Physical');
  const [loading, setLoading] = useState(false);

  // Derive cover image from bookData, ensuring https
  const coverUrl = bookData.imageLinks?.thumbnail?.replace('http://', 'https://');

  const handleSaveBook = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .insert([
          {
            title: bookData.title,
            author: bookData.authors ? bookData.authors.join(', ') : 'Unknown Author',
            cover_url: coverUrl,
            total_pages: totalPages ? parseInt(totalPages, 10) : null,
            format: format,
            // Add any other relevant fields from bookData here
          },
        ])
        .select(); // To get the inserted data back, if needed

      if (error) {
        throw error;
      }

      console.log('Book added successfully:', data);
      Alert.alert('Success', `${bookData.title} added to your library!`);
      onClose();
      onBookAdded(); // Trigger refresh in parent component
    } catch (error: any) {
      console.error('Error adding book:', error.message);
      Alert.alert('Error', `Failed to add book: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <MaterialCommunityIcons name="close-circle" size={28} color="gray" />
      </TouchableOpacity>

      <ThemedText type="title" style={styles.title}>Add Book Details</ThemedText>

      <View style={styles.bookInfo}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.coverImage} resizeMode="contain" />
        ) : (
          <View style={styles.noCover}>
            <MaterialCommunityIcons name="book-open-blank-variant" size={60} color="gray" />
            <ThemedText style={{ color: 'gray' }}>No Cover</ThemedText>
          </View>
        )}
        <View style={styles.textInfo}>
          <ThemedText type="subtitle" style={styles.bookTitle}>{bookData.title}</ThemedText>
          {bookData.authors && (
            <ThemedText style={styles.bookAuthor}>{bookData.authors.join(', ')}</ThemedText>
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Total Pages:</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="e.g., 300"
          keyboardType="numeric"
          value={totalPages}
          onChangeText={(text) => setTotalPages(text.replace(/[^0-9]/g, ''))} // Allow only numbers
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Format:</ThemedText>
        <View style={styles.formatToggle}>
          <TouchableOpacity
            style={[styles.formatOption, format === 'Physical' && styles.selectedFormat]}
            onPress={() => setFormat('Physical')}
          >
            <MaterialCommunityIcons name="book" size={20} color={format === 'Physical' ? 'white' : 'gray'} />
            <Text style={[styles.formatText, format === 'Physical' && styles.selectedFormatText]}>Physical</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.formatOption, format === 'Audio' && styles.selectedFormat]}
            onPress={() => setFormat('Audio')}
          >
            <MaterialCommunityIcons name="headphones" size={20} color={format === 'Audio' ? 'white' : 'gray'} />
            <Text style={[styles.formatText, format === 'Audio' && styles.selectedFormatText]}>Audio</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveBook}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Add Book to Library</Text>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    width: '95%',
    alignSelf: 'center',
    marginTop: 20,
    // Add shadow if not using ThemedView for shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 22,
    fontWeight: 'bold',
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  coverImage: {
    width: 80,
    height: 120,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: '#eee', // Placeholder background
  },
  noCover: {
    width: 80,
    height: 120,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  formatToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  formatOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  selectedFormat: {
    backgroundColor: '#007AFF', // A common blue for selection
  },
  formatText: {
    fontSize: 16,
    marginLeft: 5,
    color: 'gray',
  },
  selectedFormatText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#28a745', // Green save button
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
