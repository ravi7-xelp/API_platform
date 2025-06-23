import React, { createContext, useContext, useState, useEffect } from 'react';
import { Api } from '../types';
import { getApis } from '../services/api';

interface ApiContextType {
  apis: Api[];
  setApis: React.Dispatch<React.SetStateAction<Api[]>>;
  refreshApis: () => Promise<void>;
  loading: boolean;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apis, setApis] = useState<Api[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshApis = async () => {
    try {
      setLoading(true);
      const response = await getApis();
      setApis(response.data.apis || []);
    } catch (error) {
      console.error('Error fetching APIs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshApis();
  }, []);

  return (
    <ApiContext.Provider value={{ apis, setApis, refreshApis, loading }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};