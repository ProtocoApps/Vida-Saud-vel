
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
  FOME_EMOCIONAL = 'FOME_EMOCIONAL'
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
