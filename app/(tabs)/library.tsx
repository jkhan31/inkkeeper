// Filename: app/(tabs)/library.tsx
// Purpose: Displays the user's book collection grouped by status/shelf.
// FIXED: Removed 'total_units' and 'current_unit' from DB query.
// FIXED: Implements v6.0 Time-Only logic.

import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/cn';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the shape of a Book in v6.0 (Time-Only)
type Book = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  status: 'active' | 'wishlist' | 'finished';
  shelf_name: string; 
};

export default function LibraryScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);

  const fetchBooks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // CRITICAL FIX: We only select columns that actually exist in the v6.0 DB
      // REMOVED: total_units, current_unit
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, cover_url, status, shelf_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);

    } catch (e: any) {
      console.error('Error fetching library:', e);
      // Optional: Alert.alert("Library Error", e.message); 
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  // Helper to render a book card
  const renderBook = (book: Book) => (
    <TouchableOpacity 
      key={book.id}
      className="bg-white p-4 rounded-xl shadow-sm mb-4 flex-row items-center"
      // Future: Navigate to book details
      // onPress={() => router.push(`/book/${book.id}`)} 
    >
      {/* Cover Placeholder or Image */}
      <View className={cn("w-12 h-16 rounded-md mr-4 items-center justify-center bg-stone-200")}>
         {book.cover_url ? (
            <Image source={{ uri: book.cover_url }} className="w-full h-full rounded-md" />
         ) : (
            <MaterialCommunityIcons name="book-variant" size={24} color="#A8A29E" />
         )}
      </View>
      
      <View className="flex-1">
        <Text className="text-base font-bold text-sumiInk" numberOfLines={1}>{book.title}</Text>
        <Text className="text-sm text-stone-500" numberOfLines={1}>{book.author || 'Unknown Author'}</Text>
        <View className="flex-row items-center mt-1">
            <View className={cn(
                "px-2 py-0.5 rounded-md mr-2",
                book.status === 'active' ? "bg-green-100" : 
                book.status === 'finished' ? "bg-stone-100" : "bg-blue-100"
            )}>
                <Text className={cn(
                    "text-xs font-bold capitalize",
                    book.status === 'active' ? "text-green-700" : 
                    book.status === 'finished' ? "text-stone-600" : "text-blue-700"
                )}>{book.status}</Text>
            </View>
            <Text className="text-xs text-stone-400">{book.shelf_name}</Text>
        </View>
      </View>
      
      <MaterialCommunityIcons name="chevron-right" size={20} color="#D6D3D1" />
    </TouchableOpacity>
  );

  // Group books by simple status for MVP display
  const activeBooks = books.filter(b => b.status === 'active');
  const wishlistBooks = books.filter(b => b.status === 'wishlist');
  const finishedBooks = books.filter(b => b.status === 'finished');

  return (
    <SafeAreaView className="flex-1 bg-ricePaper">
      <View className="p-4 border-b border-stone-200 bg-ricePaper flex-row justify-between items-center">
          <Text className="text-2xl font-serif text-sumiInk font-bold">Your Library</Text>
          <TouchableOpacity onPress={() => router.push('/modal')}>
             <MaterialCommunityIcons name="plus-circle" size={32} color="#A26FD7" />
          </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A26FD7" />}
      >
        {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#A26FD7" className="mt-10" />
        ) : books.length === 0 ? (
            <View className="items-center justify-center mt-20 opacity-50">
                <MaterialCommunityIcons name="bookshelf" size={60} color="#A8A29E" />
                <Text className="text-stone-500 mt-4 text-center">Your library is empty.{'\n'}Tap the + button to add your first book.</Text>
            </View>
        ) : (
            <>
                {/* Active Section */}
                {activeBooks.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-sumiInk mb-3 opacity-60 uppercase tracking-widest text-xs">Currently Reading</Text>
                        {activeBooks.map(renderBook)}
                    </View>
                )}

                {/* Wishlist Section */}
                {wishlistBooks.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-sumiInk mb-3 opacity-60 uppercase tracking-widest text-xs">To Read</Text>
                        {wishlistBooks.map(renderBook)}
                    </View>
                )}

                {/* Finished Section */}
                {finishedBooks.length > 0 && (
                    <View className="mb-8">
                         <Text className="text-lg font-bold text-sumiInk mb-3 opacity-60 uppercase tracking-widest text-xs">Finished</Text>
                        {finishedBooks.map(renderBook)}
                    </View>
                )}
            </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}