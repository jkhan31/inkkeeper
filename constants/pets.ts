import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface PetStage {
  xp: number;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

export const PET_SPECIES_DATA: Record<string, PetStage[]> = {
  fox: [
    { xp: 0, icon: 'seed' },
    { xp: 250, icon: 'paw' },
    { xp: 1000, icon: 'dog-side' },
    { xp: 2500, icon: 'school' },
  ],
};
