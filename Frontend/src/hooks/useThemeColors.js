import { useTheme } from '../contexts/ThemeContext';

export const useThemeColors = () => {
  const { colors, isDark } = useTheme();
  
  return {
    colors,
    isDark,
    // สีพื้นหลัง
    bg: colors.background,
    bgSurface: colors.surface,
    bgCard: colors.card,
    
    // สีข้อความ
    text: colors.text,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    
    // สีขอบ
    border: colors.border,
    borderLight: colors.borderLight,
    
    // สีปุ่ม
    primary: colors.primary,
    primaryHover: colors.primaryHover,
    secondary: colors.secondary,
    secondaryHover: colors.secondaryHover,
    
    // สีพิเศษ
    accent: colors.accent,
    accentHover: colors.accentHover,
    success: colors.success,
    error: colors.error,
    
    // สี gradient และ shadow
    gradient: colors.gradient,
    shadow: colors.shadow,
    
    // สี hover
    hover: colors.hover,
    hoverLight: colors.hoverLight,
    
    // Helper functions
    getCardStyle: () => ({
      backgroundColor: colors.card,
      border: `1px solid ${colors.border}`,
      boxShadow: colors.shadow,
    }),
    
    getButtonStyle: (variant = 'primary') => {
      const styles = {
        primary: {
          backgroundColor: colors.primary,
          color: '#ffffff',
          border: `1px solid ${colors.primary}`,
        },
        secondary: {
          backgroundColor: colors.surface,
          color: colors.text,
          border: `1px solid ${colors.border}`,
        },
        outline: {
          backgroundColor: 'transparent',
          color: colors.text,
          border: `1px solid ${colors.border}`,
        },
        ghost: {
          backgroundColor: 'transparent',
          color: colors.text,
          border: 'none',
        },
      };
      return styles[variant] || styles.primary;
    },
    
    getInputStyle: () => ({
      backgroundColor: colors.card,
      border: `1px solid ${colors.border}`,
      color: colors.text,
    }),
    
    getHoverStyle: () => ({
      backgroundColor: colors.hover,
    }),
  };
}; 