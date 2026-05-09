import React, { createContext, useContext, useState } from 'react';

const HeaderContext = createContext();

export const useHeader = () => useContext(HeaderContext);

export const HeaderProvider = ({ children }) => {
  const [title, setTitle] = useState(null);
  const [actions, setActions] = useState([]);

  return (
    <HeaderContext.Provider value={{ title, setTitle, actions, setActions }}>
      {children}
    </HeaderContext.Provider>
  );
};
