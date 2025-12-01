export const COMPANION_DATA: Record<string, any> = {
  fox: {
    id: 'fox',
    name: 'Rusty',
    stages: [
      // Stage 1: The Kit (0 - 250 XP)
      { limit: 250, icon: 'seed', label: 'The Kit', description: 'Just starting.' },
      
      // Stage 2: The Scout (250 - 1000 XP)
      { limit: 1000, icon: 'paw', label: 'The Scout', description: 'Curious.' },
      
      // Stage 3: The Guardian (1000 - 2500 XP)
      { limit: 2500, icon: 'dog-side', label: 'The Guardian', description: 'Loyal.' },
      
      // Stage 4: The Scholar (2500+ XP)
      { limit: 5000, icon: 'school', label: 'The Scholar', description: 'Wise.' }
    ]
  }
};