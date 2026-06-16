import { createContext, useContext, useState, ReactNode } from 'react';

interface A11yContextType {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const A11yContext = createContext<A11yContextType>({ open: false, setOpen: () => {} });

export const A11yProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <A11yContext.Provider value={{ open, setOpen }}>
      {children}
    </A11yContext.Provider>
  );
};

export const useA11y = () => useContext(A11yContext);
