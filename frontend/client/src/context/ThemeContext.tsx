import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  // Apply theme class to document body
  const applyTheme = (selectedTheme: Theme) => {
    if (selectedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    // Check for user preference
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    
    // Determine which theme to use
    let initialTheme: Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      initialTheme = savedTheme;
    } else {
      initialTheme = userPrefersDark ? 'dark' : 'light';
    }
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // Update theme effect
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};