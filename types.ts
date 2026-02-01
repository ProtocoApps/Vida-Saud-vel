
export enum AppScreen {
  ONBOARDING = 'ONBOARDING',
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  DIAGNOSTICO = 'DIAGNOSTICO',
  TREINOS = 'TREINOS',
  RESPIRACAO = 'RESPIRACAO',
  RESPIRACAO_PRATICA = 'RESPIRACAO_PRATICA',
  DIARIO = 'DIARIO',
  ROTINA = 'ROTINA',
  PERFIL = 'PERFIL',
  AUDIOS = 'AUDIOS',
  FOME_EMOCIONAL = 'FOME_EMOCIONAL',
  VIDEO_PLAYER = 'VIDEO_PLAYER',
  HISTORICO = 'HISTORICO',
  EDITAR_PERFIL = 'EDITAR_PERFIL',
  NOTIFICACOES = 'NOTIFICACOES',
  NOTIFICACOES_USUARIO = 'NOTIFICACOES_USUARIO',
  ASSINATURA = 'ASSINATURA',
  PAGAMENTO_SUCESSO = 'PAGAMENTO_SUCESSO'
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
