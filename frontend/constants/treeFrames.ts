// constants/treeFrames.ts
// Static require() map for all 99 tree frames.
// Expo Metro bundler requires static requires — no dynamic paths allowed.
// Frame index 0 = seed (002.png) → index 98 = full fruit tree (100.png)

export const TREE_FRAMES = [
  require('@/assets/images/tree/002.png'), // 0  - Seed
  require('@/assets/images/tree/003.png'), // 1
  require('@/assets/images/tree/004.png'), // 2
  require('@/assets/images/tree/005.png'), // 3
  require('@/assets/images/tree/006.png'), // 4
  require('@/assets/images/tree/007.png'), // 5
  require('@/assets/images/tree/008.png'), // 6
  require('@/assets/images/tree/009.png'), // 7
  require('@/assets/images/tree/010.png'), // 8
  require('@/assets/images/tree/011.png'), // 9
  require('@/assets/images/tree/012.png'), // 10
  require('@/assets/images/tree/013.png'), // 11
  require('@/assets/images/tree/014.png'), // 12
  require('@/assets/images/tree/015.png'), // 13
  require('@/assets/images/tree/016.png'), // 14
  require('@/assets/images/tree/017.png'), // 15 - End of Seed phase
  require('@/assets/images/tree/018.png'), // 16 - Sprout begins
  require('@/assets/images/tree/019.png'), // 17
  require('@/assets/images/tree/020.png'), // 18
  require('@/assets/images/tree/021.png'), // 19
  require('@/assets/images/tree/022.png'), // 20
  require('@/assets/images/tree/023.png'), // 21
  require('@/assets/images/tree/024.png'), // 22
  require('@/assets/images/tree/025.png'), // 23
  require('@/assets/images/tree/026.png'), // 24
  require('@/assets/images/tree/027.png'), // 25
  require('@/assets/images/tree/028.png'), // 26
  require('@/assets/images/tree/029.png'), // 27
  require('@/assets/images/tree/030.png'), // 28
  require('@/assets/images/tree/031.png'), // 29
  require('@/assets/images/tree/032.png'), // 30
  require('@/assets/images/tree/033.png'), // 31
  require('@/assets/images/tree/034.png'), // 32
  require('@/assets/images/tree/035.png'), // 33 - End of Sprout phase
  require('@/assets/images/tree/036.png'), // 34 - Young Tree begins
  require('@/assets/images/tree/037.png'), // 35
  require('@/assets/images/tree/038.png'), // 36
  require('@/assets/images/tree/039.png'), // 37
  require('@/assets/images/tree/040.png'), // 38
  require('@/assets/images/tree/041.png'), // 39
  require('@/assets/images/tree/042.png'), // 40
  require('@/assets/images/tree/043.png'), // 41
  require('@/assets/images/tree/044.png'), // 42
  require('@/assets/images/tree/045.png'), // 43
  require('@/assets/images/tree/046.png'), // 44
  require('@/assets/images/tree/047.png'), // 45
  require('@/assets/images/tree/048.png'), // 46
  require('@/assets/images/tree/049.png'), // 47
  require('@/assets/images/tree/050.png'), // 48
  require('@/assets/images/tree/051.png'), // 49
  require('@/assets/images/tree/052.png'), // 50
  require('@/assets/images/tree/053.png'), // 51
  require('@/assets/images/tree/054.png'), // 52
  require('@/assets/images/tree/055.png'), // 53
  require('@/assets/images/tree/056.png'), // 54
  require('@/assets/images/tree/057.png'), // 55
  require('@/assets/images/tree/058.png'), // 56
  require('@/assets/images/tree/059.png'), // 57
  require('@/assets/images/tree/060.png'), // 58
  require('@/assets/images/tree/061.png'), // 59
  require('@/assets/images/tree/062.png'), // 60
  require('@/assets/images/tree/063.png'), // 61
  require('@/assets/images/tree/064.png'), // 62 - End of Young Tree phase
  require('@/assets/images/tree/065.png'), // 63 - Blooming begins
  require('@/assets/images/tree/066.png'), // 64
  require('@/assets/images/tree/067.png'), // 65
  require('@/assets/images/tree/068.png'), // 66
  require('@/assets/images/tree/069.png'), // 67
  require('@/assets/images/tree/070.png'), // 68
  require('@/assets/images/tree/071.png'), // 69
  require('@/assets/images/tree/072.png'), // 70
  require('@/assets/images/tree/073.png'), // 71
  require('@/assets/images/tree/074.png'), // 72
  require('@/assets/images/tree/075.png'), // 73
  require('@/assets/images/tree/076.png'), // 74
  require('@/assets/images/tree/077.png'), // 75
  require('@/assets/images/tree/078.png'), // 76
  require('@/assets/images/tree/079.png'), // 77
  require('@/assets/images/tree/080.png'), // 78
  require('@/assets/images/tree/081.png'), // 79
  require('@/assets/images/tree/082.png'), // 80 - End of Blooming phase
  require('@/assets/images/tree/083.png'), // 81 - Fruiting begins
  require('@/assets/images/tree/084.png'), // 82
  require('@/assets/images/tree/085.png'), // 83
  require('@/assets/images/tree/086.png'), // 84
  require('@/assets/images/tree/087.png'), // 85
  require('@/assets/images/tree/088.png'), // 86
  require('@/assets/images/tree/089.png'), // 87
  require('@/assets/images/tree/090.png'), // 88
  require('@/assets/images/tree/091.png'), // 89
  require('@/assets/images/tree/092.png'), // 90
  require('@/assets/images/tree/093.png'), // 91
  require('@/assets/images/tree/094.png'), // 92
  require('@/assets/images/tree/095.png'), // 93
  require('@/assets/images/tree/096.png'), // 94
  require('@/assets/images/tree/097.png'), // 95
  require('@/assets/images/tree/098.png'), // 96
  require('@/assets/images/tree/099.png'), // 97
  require('@/assets/images/tree/100.png'), // 98 - Full fruit tree (max)
];

export interface TreePhase {
  name: string;
  emoji: string;
  startFrame: number;
  endFrame: number;
  color: string;
  bgColor: string;
  description: string;
}

export const TREE_PHASES: TreePhase[] = [
  {
    name: 'Seed',
    emoji: '🌱',
    startFrame: 0,
    endFrame: 15,
    color: '#8B5E3C',
    bgColor: '#F5EBE0',
    description: 'Your journey begins with a single seed.',
  },
  {
    name: 'Sprout',
    emoji: '🌿',
    startFrame: 16,
    endFrame: 33,
    color: '#5DB85D',
    bgColor: '#EAF5EA',
    description: 'Life is breaking through the soil.',
  },
  {
    name: 'Young Tree',
    emoji: '🌳',
    startFrame: 34,
    endFrame: 62,
    color: '#3A9A3A',
    bgColor: '#E3F2E3',
    description: 'Your tree is finding its strength.',
  },
  {
    name: 'Blooming',
    emoji: '🌸',
    startFrame: 63,
    endFrame: 80,
    color: '#C06080',
    bgColor: '#FDF0F5',
    description: 'Your dedication is blossoming beautifully.',
  },
  {
    name: 'Fruiting',
    emoji: '🍊',
    startFrame: 81,
    endFrame: 98,
    color: '#E07A10',
    bgColor: '#FFF3E0',
    description: 'You are bearing the fruits of your wellness.',
  },
];

/** Returns the phase object for a given frame index (0–98) */
export function getPhaseForFrame(frame: number): TreePhase {
  return (
    TREE_PHASES.find(p => frame >= p.startFrame && frame <= p.endFrame) ??
    TREE_PHASES[0]
  );
}

/** Returns 0–1 progress within the current phase */
export function getPhaseProgress(frame: number): number {
  const phase = getPhaseForFrame(frame);
  const span = phase.endFrame - phase.startFrame;
  if (span === 0) return 1;
  return (frame - phase.startFrame) / span;
}
