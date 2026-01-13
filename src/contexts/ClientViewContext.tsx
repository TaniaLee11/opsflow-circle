import { createContext, useContext, useState, ReactNode } from "react";

export interface ViewedClient {
  id: string;
  userId: string;
  displayName: string | null;
  email: string | null;
  companyName: string | null;
  tier: string;
}

interface ClientViewContextType {
  viewedClient: ViewedClient | null;
  isViewingClient: boolean;
  setViewedClient: (client: ViewedClient | null) => void;
  clearViewedClient: () => void;
}

const ClientViewContext = createContext<ClientViewContextType | undefined>(undefined);

export function ClientViewProvider({ children }: { children: ReactNode }) {
  const [viewedClient, setViewedClientState] = useState<ViewedClient | null>(null);

  const setViewedClient = (client: ViewedClient | null) => {
    setViewedClientState(client);
  };

  const clearViewedClient = () => {
    setViewedClientState(null);
  };

  return (
    <ClientViewContext.Provider value={{
      viewedClient,
      isViewingClient: !!viewedClient,
      setViewedClient,
      clearViewedClient
    }}>
      {children}
    </ClientViewContext.Provider>
  );
}

export function useClientView() {
  const context = useContext(ClientViewContext);
  if (context === undefined) {
    throw new Error("useClientView must be used within a ClientViewProvider");
  }
  return context;
}
