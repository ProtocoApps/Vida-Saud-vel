import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

interface GlobalUserContextType {
  userName: string;
  userEmail: string;
  userAvatar: string | null;
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
}

export const GlobalUserProvider: React.FC<GlobalUserProviderProps> = ({ children }) => {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setUserData = (user: User) => {
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

  return (
    <GlobalUserContext.Provider value={{
      userName,
      userEmail,
      userAvatar,
      setUserData,
      loading
    }}>
      {children}
    </GlobalUserContext.Provider>
  );
};
