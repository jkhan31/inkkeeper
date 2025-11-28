import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import CreateShelfModal from '../../components/CreateShelfModal'; // <--- IMPORT 1

// Define the book type for type safety
interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  status: 'active' | 'wishlist' | 'finished';
  total_units: number;
  current_unit: number;
  shelf_name: string | null;
}

interface Shelves {
  [key: string]: Book[];
}

export default function LibraryScreen() {
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [shelves, setShelves] = useState<Shelves>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // --- NEW STATE FOR MODAL ---
  const [isCreateShelfVisible, setCreateShelfVisible] = useState(false);
  const [allBooksRaw, setAllBooksRaw] = useState<Book[]>([]); 

  // 1. Data Fetching & Processing
  const fetchLibrary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data: allBooks, error } = await supabase
        .from('books')
        .select('id, title, author, cover_url, status, total_units, current_unit, shelf_name')
        .eq('user_id', user.id);

      if (error) throw error;

      // --- SAVE RAW DATA FOR MODAL ---
      setAllBooksRaw(allBooks); 

      // 2. Data Processing: Isolate active book and group the rest
      const active = allBooks.find(b => b.status === 'active') || null;
      setActiveBook(active);

      const shelvedBooks = allBooks.filter(b => b.status !== 'active');
      const groupedShelves = shelvedBooks.reduce<Shelves>((acc, book) => {
        const shelfKey = book.shelf_name || 'My Library'; // Default shelf
        if (!acc[shelfKey]) {
          acc[shelfKey] = [];
        }
        acc[shelfKey].push(book);
        return acc;
      }, {});
      setShelves(groupedShelves);

    } catch (error: any) {
      Alert.alert('Error Fetching Library', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLibrary();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLibrary();
    setRefreshing(false);
  }, []);
    
  // 4. Interactions
  const handleBookPress = (book: Book) => {
    // Placeholder for opening BookDetailsModal
    // For now, we just log it. Later this will open the book details.
    console.log("Tapped on book:", book.title);
  };

  // Keep this logic for single-book moves if you want, 
  // or rely entirely on the new Modal.
  const handleMoveToShelf = (book: Book) => {
    Alert.prompt(
      "Move to Shelf",
      `Enter a new shelf name for "${book.title}".`,
      async (newShelfName) => {
        if (!newShelfName || newShelfName.trim() === '') return;

        try {
          const { error } = await supabase
            .from('books')
            .update({ shelf_name: newShelfName.trim() })
            .eq('id', book.id);
            
          if (error) throw error;
          
          fetchLibrary(); // Refresh

        } catch (error: any) {
          Alert.alert("Error", error.message);
        }
      },
      'plain-text',
      book.shelf_name || ''
    );
  };
    
  // --- UPDATED HANDLER ---
  const handleAddNewShelf = () => {
      setCreateShelfVisible(true);
  };

  // --- Render Components ---

  const renderActiveBook = () => {
    if (!activeBook) return null;
    const progress = Math.round((activeBook.current_unit / activeBook.total_units) * 100);

    return (
      <View className="p-4 bg-stone-100">
        <Text className="font-serif text-xl font-bold text-stone-800 ml-4 mb-3">Reading Now</Text>
        <TouchableOpacity 
          onPress={() => handleBookPress(activeBook)}
          className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200"
        >
          <View className="flex-row">
            {activeBook.cover_url ? (
                <Image source={{ uri: activeBook.cover_url }} className="w-24 h-36 rounded-lg shadow-md shadow-black/20" />
            ) : (
                <View className="w-24 h-36 bg-stone-300 rounded-lg items-center justify-center">
                    <MaterialCommunityIcons name="book" size={40} color="white" />
                </View>
            )}
            
            <View className="flex-1 ml-4 justify-between">
                <View>
                    <Text className="text-lg font-bold text-stone-800" numberOfLines={2}>{activeBook.title}</Text>
                    <Text className="text-sm text-stone-500">{activeBook.author}</Text>
                </View>
                <View>
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-xs text-stone-400">{activeBook.current_unit} / {activeBook.total_units}</Text>
                        <Text className="text-xs font-bold text-stone-500">{progress}%</Text>
                    </View>
                    <View className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <View className="h-full bg-orange-500" style={{ width: `${progress}%` }} />
                    </View>
                </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderShelf = ({ name, books }: { name: string, books: Book[] }) => (
    <View key={name} className="py-4 bg-stone-100">
      <Text className="font-serif text-xl font-bold text-stone-800 ml-4 mb-2">{name}</Text>
      <View className="bg-stone-50 py-4">
        <FlatList
          horizontal
          data={books}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => handleBookPress(item)}
              onLongPress={() => handleMoveToShelf(item)}
              className="mr-3"
            >
              {item.cover_url ? (
                  <Image 
                    source={{ uri: item.cover_url }} 
                    className="w-28 h-40 rounded-md shadow-sm bg-stone-200"
                    resizeMode="cover"
                  />
              ) : (
                  <View className="w-28 h-40 rounded-md shadow-sm bg-stone-200 items-center justify-center">
                     <MaterialCommunityIcons name="book-open-variant" size={32} color="#A8A29E" />
                     <Text className="text-xs text-stone-500 text-center mt-2 px-1" numberOfLines={2}>{item.title}</Text>
                  </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );

  if (loading) {
    return <View className="flex-1 justify-center items-center bg-stone-100"><ActivityIndicator size="large" color="#EA580C" /></View>;
  }

  const hasContent = activeBook || Object.keys(shelves).length > 0;

  // 3. UI Layout
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-stone-100">
        <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />}
        >
            {hasContent ? (
                <>
                    {renderActiveBook()}
                    {Object.entries(shelves).map(([name, books]) => renderShelf({ name, books }))}
                    
                    {/* Add Shelf Button */}
                    <View className="py-8 items-center pb-20">
                        <TouchableOpacity onPress={handleAddNewShelf} className="border border-dashed border-stone-300 rounded-full px-4 py-2 flex-row items-center">
                           <MaterialCommunityIcons name="plus" size={16} color="#78716C" />
                           <Text className="text-stone-500 font-bold text-xs ml-1">Create New Shelf</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View className="flex-1 items-center justify-center pt-32">
                    <MaterialCommunityIcons name="bookshelf" size={48} color="#D6D3D1" />
                    <Text className="text-stone-500 mt-4 text-center px-8">Your library is empty.{"\n"}Tap the '+' button to add your first book.</Text>
                </View>
            )}
        </ScrollView>

        {/* --- THE NEW MODAL --- */}
        <CreateShelfModal 
            visible={isCreateShelfVisible}
            // Filter out the active book so users don't accidentally move it to a shelf
            books={allBooksRaw.filter(b => b.status !== 'active')} 
            onClose={() => setCreateShelfVisible(false)}
            onSuccess={() => {
                fetchLibrary(); // Refresh the list
            }}
        />
    </SafeAreaView>
  );
}