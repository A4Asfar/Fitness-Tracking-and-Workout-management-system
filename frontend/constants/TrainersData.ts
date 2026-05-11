export interface Trainer {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  specialization: string;
  experience: string;
  expertise: string;
  status: 'Available' | 'Busy';
  image: string;
  accentColor: string;
  bio: string;
  recommendedFor: string;
  supportNote: string;
}

export const TRAINERS: Trainer[] = [
  {
    id: 'marcus-vane',
    name: 'Marcus Vane',
    gender: 'Male',
    specialization: 'Strength Coach',
    experience: '10 years',
    expertise: 'Powerlifting & Explosive Strength',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fe?q=80&w=800&auto=format&fit=crop',
    accentColor: '#CCFF00',
    bio: 'Marcus has spent over a decade training elite athletes and powerlifters. His philosophy centers on progressive overload and bulletproof form to ensure long-term health and massive gains.',
    recommendedFor: 'Building raw strength, mass gain, and technical lifting refinement.',
    supportNote: 'I focus on the "why" behind every lift. Ready to break your PRs?'
  },
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    gender: 'Female',
    specialization: 'Cardio Coach',
    experience: '8 years',
    expertise: 'HIIT & Marathon Prep',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=800&auto=format&fit=crop',
    accentColor: '#00D1FF',
    bio: 'Sarah is a certified endurance specialist who believes that cardiovascular health is the foundation of all fitness. She designs programs that boost metabolic rate and heart health simultaneously.',
    recommendedFor: 'Fat loss, heart health, and endurance training for all levels.',
    supportNote: 'Consistency beats intensity every time. Let\'s build your engine.'
  },
  {
    id: 'viktor-steel',
    name: 'Viktor Steel',
    gender: 'Male',
    specialization: 'Bodybuilding Coach',
    experience: '15 years',
    expertise: 'Hypertrophy & Aesthetics',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa200c01?q=80&w=800&auto=format&fit=crop',
    accentColor: '#FF4B4B',
    bio: 'Viktor is a former competitive bodybuilder with a passion for sculpting physiques. He combines old-school intensity with modern sports science to help clients achieve their ultimate aesthetic potential.',
    recommendedFor: 'Muscle hypertrophy, symmetry, and competition prep.',
    supportNote: 'Discipline is the bridge between goals and accomplishment. Let\'s sculpt your best self.'
  },
  {
    id: 'elena-rossi',
    name: 'Elena Rossi',
    gender: 'Female',
    specialization: 'Yoga Trainer',
    experience: '12 years',
    expertise: 'Mobility & Mindfulness',
    status: 'Busy',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=800&auto=format&fit=crop',
    accentColor: '#A855F7',
    bio: 'With 12 years of practice in Hatha and Vinyasa Yoga, Elena helps athletes find balance through mobility and mindful recovery techniques.',
    recommendedFor: 'Active recovery, flexibility, and stress management.',
    supportNote: 'Your body needs rest as much as it needs work. Let\'s find your flow.'
  },
  {
    id: 'david-miller',
    name: 'David Miller',
    gender: 'Male',
    specialization: 'Nutrition Coach',
    experience: '7 years',
    expertise: 'Performance Fueling',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop',
    accentColor: '#FFD700',
    bio: 'David combines sports science with practical nutrition to help clients fuel their workouts and recover faster without restrictive dieting.',
    recommendedFor: 'Fat loss, performance fueling, and healthy habit building.',
    supportNote: 'Food is fuel, not the enemy. Let\'s optimize your plate.'
  },
  {
    id: 'maya-soul',
    name: 'Maya Soul',
    gender: 'Female',
    specialization: 'Wellness Trainer',
    experience: '9 years',
    expertise: 'Holistic Health & Longevity',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
    accentColor: '#39FF14',
    bio: 'Maya focuses on the connection between mind, body, and spirit. Her holistic approach ensures that fitness is sustainable and integrated into a balanced lifestyle for long-term longevity.',
    recommendedFor: 'Stress reduction, habit formation, and lifestyle optimization.',
    supportNote: 'Wellness is a journey, not a destination. Let\'s make it a beautiful one.'
  }
];
