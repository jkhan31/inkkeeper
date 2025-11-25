import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function LibraryScreen() {
  const [books, setBooks] = useState<any[]>([]);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchLibrary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Active Book ID
      const { data: profile } = await supabase.from('profiles').select('active_book_id').eq('id', user.id).single();
      const currentActiveId = profile?.active_book_id;
      setActiveBookId(currentActiveId);

      // 2. Get All Books
      const { data: allBooks, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 3. Sort: Active Book First
      const sortedBooks = (allBooks || []).sort((a, b) => {
        if (a.id === currentActiveId) return -1;
        if (b.id === currentActiveId) return 1;
        return 0;
      });

      setBooks(sortedBooks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = (book: any) => {
    if (book.id === activeBookId) return; // Already active

    Alert.alert(
      "Swap Active Read?",
      `Do you want to pause your current book and start reading "${book.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Swap", 
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              // Update Profile
              const { error } = await supabase
                .from('profiles')
                .update({ active_book_id: book.id })
                .eq('id', user.id);

              if (error) throw error;

              // Refresh List
              fetchLibrary();
            } catch (err) {
              Alert.alert("Error", "Could not swap books.");
            }
          }
        }
      ]
    );
  };

  const renderBook = ({ item }: { item: any }) => {
    const isActive = item.id === activeBookId;
    const progress = Math.round((item.current_unit / item.total_units) * 100);

    return (
      <TouchableOpacity 
        onPress={() => handleSwap(item)}
        className={`bg-white p-4 rounded-xl border mb-3 flex-row items-center shadow-sm ${isActive ? 'border-orange-200 bg-orange-50/30' : 'border-stone-200'}`}
      >
        {/* Cover */}
        {item.cover_url ? (
          <Image source={{ uri: item.cover_url }} className="w-12 h-16 rounded mr-4 bg-stone-200" resizeMode="cover" />
        ) : (
          <View className="w-12 h-16 rounded mr-4 bg-stone-200 items-center justify-center">
            <MaterialCommunityIcons name="book" size={20} color="#78716C" />
          </View>
        )}

        {/* Info */}
        <View className="flex-1">
          <Text className="font-bold text-stone-800 text-base" numberOfLines={1}>{item.title}</Text>
          <Text className="text-stone-500 text-xs mb-2">{item.author}</Text>
          
          {/* Progress Bar */}
          <View className="h-1.5 bg-stone-100 rounded-full overflow-hidden w-full max-w-[120px]">
             <View className={`h-full ${isActive ? 'bg-orange-500' : 'bg-stone-400'}`} style={{ width: `${progress}%` }} />
          </View>
        </View>

        {/* Badge */}
        <View>
          {isActive ? (
            <View className="bg-emerald-100 px-2 py-1 rounded-full items-center">
              <Text className="text-emerald-700 text-[10px] font-bold uppercase">Active</Text>
            </View>
          ) : (
            <MaterialCommunityIcons name="swap-horizontal" size={20} color="#D6D3D1" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      <View className="p-5 pb-2 border-b border-stone-200/50">
        <Text className="text-2xl font-serif text-stone-800">The Archives</Text>
        <Text className="text-stone-500 text-xs mt-1">{books.length} Books in Collection</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center"><ActivityIndicator color="#EA580C" /></View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBook}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />}
          ListEmptyComponent={
             <View className="items-center mt-20">
                <MaterialCommunityIcons name="bookshelf" size={48} color="#D6D3D1" />
                <Text className="text-stone-400 mt-4">Your library is empty.</Text>
             </View>
          }
        />
      )}
    </SafeAreaView>
  );
}