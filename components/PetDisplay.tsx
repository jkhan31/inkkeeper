import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { PET_SPECIES_DATA, PetStage } from '../constants/pets';
import { User } from '@supabase/supabase-js';

export default function PetDisplay() {
  const [companion, setCompanion] = useState<{ xp: number; species: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };

    const fetchCompanion = async () => {
      try {
        const { data, error } = await supabase
          .from('companions')
          .select('xp, species')
          .eq('user_id', user.id)
          .eq('active', true)
          .single();

        if (error) {
            if (error.code === 'PGRST116') {
                setCompanion(null);
            } else {
                throw error;
            }
        } else {
            setCompanion(data);
        }

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanion();
  }, [user]);

  const getPetStage = (): PetStage | null => {
      if (!companion) return null;
      const { xp, species } = companion;
      const speciesData = PET_SPECIES_DATA[species];
      if (!speciesData) return null;

      let currentStage: PetStage = speciesData[0];
      for (const stage of speciesData) {
          if (xp >= stage.xp) {
              currentStage = stage;
          } else {
              break;
          }
      }
      return currentStage;
  }

  const stage = getPetStage();

  return (
    <View style={{width: 128, height: 128, borderRadius: 64, backgroundColor: '#F5F5F4', borderWidth: 2, borderColor: '#FDBA74', alignItems: 'center', justifyContent: 'center' }}>
        {loading && <View style={{width: '100%', height: '100%', borderRadius: 64, backgroundColor: '#E7E5E4' }} />}
        {!loading && error && <MaterialCommunityIcons name="alert-circle-outline" size={50} color="red" />}
        {!loading && !error && companion && stage && (
            <MaterialCommunityIcons name={stage.icon} size={100} color="#EA580C" />
        )}
        {!loading && !error && !companion && (
             <MaterialCommunityIcons name="sleep" size={50} color="#A8A29E" />
        )}
    </View>
  );
}
