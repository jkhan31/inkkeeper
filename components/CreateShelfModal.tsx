import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

interface Book {
  id: string;
  title: string;
  cover_url: string;
  shelf_name: string | null;
}

interface CreateShelfModalProps {
  visible: boolean;
  books: Book[]; // Pass all books to choose from
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateShelfModal({ visible, books, onClose, onSuccess }: CreateShelfModalProps) {
  const [shelfName, setShelfName] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter out books that are already on custom shelves? 
  // For now, let's show all books so users can move them from other shelves easily.
  const availableBooks = books;

  const toggleBook = (id: string) => {
    if (selectedBookIds.includes(id)) {
      setSelectedBookIds(prev => prev.filter(bId => bId !== id));
    } else {
      setSelectedBookIds(prev => [...prev, id]);
    }
  };

  const handleCreate = async () => {
    if (!shelfName.trim()) {
      Alert.alert("Missing Name", "Please give your shelf a name.");
      return;
    }
    if (selectedBookIds.length === 0) {
      Alert.alert("Empty Shelf", "A shelf needs at least one book to exist. Please select a book to move.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('books')
        .update({ shelf_name: shelfName.trim() })
        .in('id', selectedBookIds);

      if (error) throw error;

      // Reset and close
      setShelfName('');
      setSelectedBookIds([]);
      onSuccess();
      onClose();

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-stone-50 p-6">
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-serif text-2xl text-stone-800 font-bold">New Shelf</Text>
          <TouchableOpacity onPress={onClose} className="bg-stone-200 p-2 rounded-full">
            <MaterialCommunityIcons name="close" size={24} color="#57534E" />
          </TouchableOpacity>
        </View>

        {/* Input */}
        <View className="mb-6">
          <Text className="text-xs uppercase text-stone-500 font-bold mb-2 tracking-widest">Shelf Name</Text>
          <TextInput
            value={shelfName}
            onChangeText={setShelfName}
            placeholder="e.g. Sci-Fi, Favorites, To Read"
            className="bg-white border border-stone-200 rounded-xl px-4 py-4 text-lg font-serif text-stone-800"
          />
        </View>

        {/* Book Selector */}
        <Text className="text-xs uppercase text-stone-500 font-bold mb-2 tracking-widest">Select Books to Move</Text>
        <FlatList
          data={availableBooks}
          keyExtractor={item => item.id}
          className="bg-white rounded-xl border border-stone-200 mb-6"
          renderItem={({ item }) => {
            const isSelected = selectedBookIds.includes(item.id);
            return (
              <TouchableOpacity 
                onPress={() => toggleBook(item.id)}
                className={`flex-row items-center p-3 border-b border-stone-100 ${isSelected ? 'bg-orange-50' : ''}`}
              >
                <Image source={{ uri: item.cover_url }} className="w-10 h-14 rounded bg-stone-200" />
                <View className="flex-1 ml-3">
                  <Text className="font-bold text-stone-800" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-xs text-stone-400">Currently: {item.shelf_name || 'General'}</Text>
                </View>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-stone-300'}`}>
                  {isSelected && <MaterialCommunityIcons name="check" size={16} color="white" />}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* Footer */}
        <TouchableOpacity 
          onPress={handleCreate}
          disabled={loading}
          className="bg-stone-800 py-4 rounded-xl flex-row items-center justify-center mb-6 shadow-lg"
        >
          {loading ? (
             <ActivityIndicator color="white" />
          ) : (
             <>
               <MaterialCommunityIcons name="plus-circle" size={20} color="white" />
               <Text className="text-white font-bold ml-2 text-lg">Create Shelf</Text>
             </>
          )}
        </TouchableOpacity>

      </View>
    </Modal>
  );
}