
export enum AppScreen {
  ONBOARDING = 'ONBOARDING',
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  DIAGNOSTICO = 'DIAGNOSTICO',
  TREINOS = 'TREINOS',
  RESPIRACAO = 'RESPIRACAO',
  DIARIO = 'DIARIO',
  ROTINA = 'ROTINA',
  PERFIL = 'PERFIL',
  AUDIOS = 'AUDIOS',
  FOME_EMOCIONAL = 'FOME_EMOCIONAL',
  VIDEO_PLAYER = 'VIDEO_PLAYER'
}

export interface Workout {
  id: string;
  title: string;
  duration: string;
  tag: string;
  objective: string;
  imageUrl: string;
  recommended?: boolean;
}

export interface AudioTrack {
  id: string;
  title: string;
  duration: string;
  category: string;
  imageUrl: string;
}

export interface NavigationParams {
  videoUrl?: string;
  title?: string;
  category?: string;
  duration?: string;
}

export interface NavigateFunction {
  (screen: AppScreen | { screen: AppScreen; params?: NavigationParams }): void;
}
