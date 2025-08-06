import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // ตรวจสอบธีมที่บันทึกไว้ใน localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // ถ้าไม่มีข้อมูลที่บันทึกไว้ ให้ใช้ธีมตามระบบ
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // บันทึกธีมลง localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // อัปเดต class ของ body
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: {
      // สีพื้นหลัง
      background: isDark ? '#0a0a0a' : '#ffffff',
      surface: isDark ? '#1a1a1a' : '#f8f9fa',
      card: isDark ? '#2a2a2a' : '#ffffff',
      
      // สีข้อความ
      text: isDark ? '#ffffff' : '#1a1a1a',
      textSecondary: isDark ? '#a0a0a0' : '#6b7280',
      textMuted: isDark ? '#6b6b6b' : '#9ca3af',
      
      // สีขอบ
      border: isDark ? '#3a3a3a' : '#e5e7eb',
      borderLight: isDark ? '#4a4a4a' : '#f3f4f6',
      
      // สีปุ่ม
      primary: isDark ? '#3b82f6' : '#2563eb',
      primaryHover: isDark ? '#60a5fa' : '#1d4ed8',
      secondary: isDark ? '#6b7280' : '#6b7280',
      secondaryHover: isDark ? '#9ca3af' : '#4b5563',
      
      // สีพิเศษ
      accent: isDark ? '#f59e0b' : '#f59e0b',
      accentHover: isDark ? '#fbbf24' : '#d97706',
      success: isDark ? '#10b981' : '#059669',
      error: isDark ? '#ef4444' : '#dc2626',
      
      // สี gradient
      gradient: isDark 
        ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      
      // สี shadow
      shadow: isDark 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      
      // สี hover
      hover: isDark ? '#3a3a3a' : '#f3f4f6',
      hoverLight: isDark ? '#4a4a4a' : '#f9fafb',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}; 