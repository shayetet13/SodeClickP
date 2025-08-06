import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-in-out ${className}`}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        boxShadow: colors.shadow,
      }}
      aria-label={isDark ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมดำ'}
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <Sun 
          size={20} 
          className={`absolute inset-0 transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
          style={{ color: colors.accent }}
        />
        
        {/* Moon Icon */}
        <Moon 
          size={20} 
          className={`absolute inset-0 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
          style={{ color: colors.accent }}
        />
      </div>
      
      {/* Hover Effect */}
      <div 
        className="absolute inset-0 rounded-full transition-all duration-300 opacity-0 hover:opacity-100"
        style={{ backgroundColor: colors.hover }}
      />
    </button>
  );
};

// Floating Theme Toggle สำหรับใช้ในส่วนต่างๆ
export const FloatingThemeToggle = ({ position = 'fixed' }) => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <div 
      className={`${position} top-6 right-6 z-50`}
      style={{ 
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '50%',
        boxShadow: colors.shadow,
      }}
    >
      <button
        onClick={toggleTheme}
        className="relative inline-flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ease-in-out hover:scale-110"
        style={{
          backgroundColor: colors.surface,
          color: colors.text,
        }}
        aria-label={isDark ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมดำ'}
      >
        <div className="relative w-6 h-6">
          <Sun 
            size={22} 
            className={`absolute inset-0 transition-all duration-300 ${
              isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`}
            style={{ color: colors.accent }}
          />
          <Moon 
            size={22} 
            className={`absolute inset-0 transition-all duration-300 ${
              isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
            }`}
            style={{ color: colors.accent }}
          />
        </div>
      </button>
    </div>
  );
}; 