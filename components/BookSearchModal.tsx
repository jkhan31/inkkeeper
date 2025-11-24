import React, { useState } from 'react';
import { 
  Modal, View, Text, TextInput, TouchableOpacity, FlatList, Image, 
  ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AddBookForm from './ui/AddBookForm'; // Import the new form

interface BookSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BookSearchModal({ visible, onClose }: BookSearchModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  // New State for handling the selection
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const info = item.volumeInfo;
    const cover = info.imageLinks?.thumbnail;
    return (
      <TouchableOpacity 
        className="flex-row items-center bg-stone-50 p-3 mb-2 rounded-lg border border-stone-200"
        onPress={() => setSelectedBook(info)} // Open the Form
      >
        {cover ? (
          <Image source={{ uri: cover }} className="w-10 h-14 rounded mr-3" />
        ) : (
          <View className="w-10 h-14 bg-stone-200 rounded mr-3 items-center justify-center">
            <MaterialCommunityIcons name="book" size={20} color="#78716C" />
          </View>
        )}
        <View className="flex-1">
          <Text className="font-bold text-stone-800" numberOfLines={1}>{info.title}</Text>
          <Text className="text-stone-500 text-xs" numberOfLines={1}>
            {info.authors ? info.authors.join(', ') : 'Unknown'}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#D6D3D1" />
      </TouchableOpacity>
    );
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end bg-black/50">
        
        {/* If a book is selected, show the Add Form instead of the Search List */}
        {selectedBook ? (
          <View className="bg-white h-[85%] rounded-t-3xl p-5 shadow-xl">
             <AddBookForm 
               bookData={selectedBook} 
               onClose={() => setSelectedBook(null)} // Go back to search
             />
          </View>
        ) : (
          /* OTHERWISE, show the Search List */
          <View className="bg-white h-[85%] rounded-t-3xl p-5 shadow-xl">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-serif text-stone-800">Log New Book</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close-circle" size={28} color="#D6D3D1" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row mb-4">
              <View className="flex-1 bg-stone-100 rounded-l-xl p-3 flex-row items-center border-y border-l border-stone-200">
                <TextInput 
                  placeholder="Search Title..." 
                  value={query} 
                  onChangeText={setQuery} 
                  className="flex-1 text-stone-800" 
                  onSubmitEditing={handleSearch}
                />
              </View>
              <TouchableOpacity onPress={handleSearch} className="bg-stone-800 px-4 justify-center rounded-r-xl">
                <Text className="text-white font-bold">Find</Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            {loading ? <ActivityIndicator size="large" color="#EA580C" className="mt-10" /> : 
              <FlatList 
                data={results} 
                renderItem={renderItem} 
                keyExtractor={(item) => item.id} 
                ListEmptyComponent={
                  <View className="items-center mt-10">
                    <Text className="text-stone-400">Search for a book to add it.</Text>
                  </View>
                }
              />
            }
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}