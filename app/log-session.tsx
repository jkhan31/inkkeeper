
import React, { useState, useEffect, useMemo } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useLocalSearchParams, router } from 'expo-router';

// Mock data - in a real app, this would come from route params or a global state
const mockBook = {
  id: '1',
  title: 'The Way of Kings',
  format: 'physical', // or 'audio'
  lastKnownPage: 120,
};

export default function LogSessionScreen() {
  // const { bookId } = useLocalSearchParams();
  // For now, we'll use the mock book
  const book = mockBook;

  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [startPage, setStartPage] = useState(book.lastKnownPage.toString());
  const [endPage, setEndPage] = useState('');
  const [minutesListened, setMinutesListened] = useState('0');
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (!isActive && timer !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
        if(interval) clearInterval(interval)
    };
  }, [isActive, timer]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleFinish = () => {
    setIsActive(false);
    setIsFinished(true);
    if (book.format === 'audio') {
      const minutes = Math.floor(timer / 60);
      setMinutesListened(minutes.toString());
    }
  };

  const inkEarned = useMemo(() => {
    let ink = 0;
    if (book.format === 'physical') {
      const start = parseInt(startPage, 10) || 0;
      const end = parseInt(endPage, 10) || 0;
      if (end > start) ink = end - start;
    } else {
      ink = parseInt(minutesListened, 10) || 0;
    }
    if (reflection.length > 10) {
      ink += 20; // Bonus Ink
    }
    return ink;
  }, [startPage, endPage, minutesListened, reflection, book.format]);

  const handleSave = () => {
    const sessionData = {
      bookId: book.id,
      durationSeconds: timer,
      reflection,
      inkEarned,
      ...(book.format === 'physical' ? { startPage, endPage } : { minutesListened }),
    };
    console.log('Session Saved:', sessionData);
    router.back();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  return (
    <ThemedView style={styles.container}>
      {!isFinished ? (
        <>
          <ThemedText style={styles.timerDisplay}>{formatTime(timer)}</ThemedText>
          <View style={styles.buttonGroup}>
            <Button title={isActive ? 'Pause' : 'Start'} onPress={handleStartPause} />
            <View style={{width: 20}} />
            <Button title="Finish" onPress={handleFinish} color="#FF6347" />
          </View>
        </>
      ) : (
        <View style={styles.formContainer}>
            <ThemedText type='subtitle' style={{textAlign: 'center', marginBottom: 20}}>Log your session for "{book.title}"</ThemedText>
          {book.format === 'physical' ? (
            <>
              <TextInput
                placeholder="Start Page"
                style={styles.input}
                value={startPage}
                onChangeText={setStartPage}
                keyboardType="number-pad"
              />
              <TextInput
                placeholder="End Page"
                style={styles.input}
                value={endPage}
                onChangeText={setEndPage}
                keyboardType="number-pad"
                autoFocus={true}
              />
            </>
          ) : (
            <>
              <ThemedText>Minutes Listened</ThemedText>
              <TextInput
                style={styles.input}
                value={minutesListened}
                onChangeText={setMinutesListened}
                keyboardType="number-pad"
              />
            </>
          )}
          <TextInput
            placeholder="Reflection (+20 Ink for >10 chars)"
            style={[styles.input, styles.reflectionInput]}
            value={reflection}
            onChangeText={setReflection}
            multiline
          />
          <ThemedText style={{marginVertical: 10, textAlign: 'center'}}>Ink Earned: {inkEarned}</ThemedText>
          <Button title="Save Session" onPress={handleSave} />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timerDisplay: {
    fontSize: 72, // Tailwind 'text-6xl' is ~72px
    fontFamily: 'monospace',
    marginBottom: 40,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  formContainer: {
      width: '100%',
      padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
  },
  reflectionInput: {
      minHeight: 100,
      textAlignVertical: 'top'
  }
});
