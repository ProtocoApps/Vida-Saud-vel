import breathingExerciseJson from './animations/breathing-exercise.json';
import rippleAlertJson from './animations/Ripple Alert.json';
import writingBlueBgJson from './animations/Writing - Blue BG.json';
import familyHugJson from './animations/family hug.json';

export const animationData = {
  breathing: breathingExerciseJson,
  focus: rippleAlertJson,
  anguish: writingBlueBgJson,
  safety: familyHugJson
};

export type AnimationCategory = 'breathing' | 'focus' | 'anguish' | 'safety';
