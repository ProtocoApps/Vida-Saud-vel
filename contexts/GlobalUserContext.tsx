import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface GlobalUserContextType {
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  userData: User | null;
  setUserData: (user: User) => void;
  loading: boolean;
}

const GlobalUserContext = createContext<GlobalUserContextType | undefined>(undefined);

export const useGlobalUser = () => {
  const context = useContext(GlobalUserContext);
  if (context === undefined) {
    throw new Error('useGlobalUser must be used within a GlobalUserProvider');
  }
  return context;
};

interface GlobalUserProviderProps {
  children: React.ReactNode;
  user?: any;
}

export const GlobalUserProvider: React.FC<GlobalUserProviderProps> = ({ children, user }) => {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userData, setUserDataState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setUserData(user);
    } else {
      setLoading(false);
    }
  }, [user]);

  const setUserData = (user: User) => {
    setUserDataState(user);
    const nameFromMetadata = user.user_metadata?.name;
    if (nameFromMetadata) {
      setUserName(nameFromMetadata);
    }
    
    setUserEmail(user.email || '');
    
    const avatarFromMetadata = user.user_metadata?.avatar_url;
    if (avatarFromMetadata) {
      setUserAvatar(avatarFromMetadata);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserData(user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setLoading(false);
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserData(session.user);
      } else {
        setUserDataState(null);
        setUserName('');
        setUserEmail('');
        setUserAvatar(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GlobalUserContext.Provider value={{
      userName,
      userEmail,
      userAvatar,
      userData,
      setUserData,
      loading
    }}>
      {children}
    </GlobalUserContext.Provider>
  );
};
