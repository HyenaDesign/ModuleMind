export type ProgressScore = {
  correct: number;
  percentage: number;
};

export const XP_PER_MODULE = 40;
export const XP_PER_CORRECT_ANSWER = 12;
export const XP_PER_PERCENT = 2;
export const XP_PER_LEVEL = 500;

export const calculateXp = (scores: ProgressScore[]) => scores.reduce((sum, score) => (
  sum + XP_PER_MODULE + (score.correct * XP_PER_CORRECT_ANSWER) + Math.round(score.percentage * XP_PER_PERCENT)
), 0);

export const getLevelStats = (xp: number) => {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentLevelXp = (level - 1) * XP_PER_LEVEL;
  const nextLevelXp = level * XP_PER_LEVEL;
  return {
    level,
    xpToNextLevel: nextLevelXp - xp,
    progress: Math.min(100, Math.round(((xp - currentLevelXp) / XP_PER_LEVEL) * 100)),
  };
};

export const calculateScoreXp = (score: ProgressScore) => calculateXp([score]);
