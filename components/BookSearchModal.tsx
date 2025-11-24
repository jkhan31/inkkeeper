import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AddBookForm from './AddBookForm';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Link, router } from 'expo-router';

export default function BookSearchModal() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const searchBooks = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
      const data = await response.json();
      if (data.items) {
        setResults(data.items);
      } else {
        setError('No books found.');
      }
    } catch (e) {
      setError('Failed to fetch books. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book.volumeInfo);
    setIsFormVisible(true);
  };

  const handleManualEntry = () => {
    setSelectedBook(null); // No pre-filled data
    setIsFormVisible(true);
  };

  const handleSaveBook = (bookData) => {
    // Here you would typically save the book data to your database (e.g., via Supabase)
    console.log('Book saved:', bookData);
    // After saving, you might want to close the modal or navigate away
    setIsFormVisible(false);
    setSelectedBook(null);
    setQuery('');
    setResults([]);
    router.dismiss(); // Dismiss the modal
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setSelectedBook(null);
  };

  if (isFormVisible) {
    return (
      <AddBookForm
        bookData={selectedBook}
        onSave={handleSaveBook}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Search for a Book</ThemedText>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter title, author, or ISBN"
          value={query}
          onChangeText={setQuery}
        />
        <Button title="Search" onPress={searchBooks} disabled={loading} />
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <ThemedText style={{ color: 'red', marginTop: 10 }}>{error}</ThemedText>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectBook(item)}>
            <View style={styles.resultItem}>
              <Image
                source={{ uri: item.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || 'https://via.placeholder.com/100x150.png?text=No+Cover' }}
                style={styles.coverImage}
              />
              <View style={styles.bookInfo}>
                <ThemedText style={styles.title}>{item.volumeInfo.title}</ThemedText>
                <ThemedText style={styles.author}>{item.volumeInfo.authors?.join(', ')}</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        )}
        style={{ marginTop: 10, width: '100%' }}
      />

      <View style={styles.manualButtonContainer}>
          <Button title="Manual Entry" onPress={handleManualEntry} />
      </View>
        <Link href="../" style={styles.link}>
            <ThemedText type="link">Dismiss</ThemedText>
        </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: 'white',
  },
  resultItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    width: '100%',
  },
  coverImage: {
    width: 50,
    height: 75,
    marginRight: 10,
  },
  bookInfo: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  author: {
    color: '#666',
  },
  manualButtonContainer: {
      marginTop: 20,
      marginBottom: 20,
  },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
});
