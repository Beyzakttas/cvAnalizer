import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCVStore } from '../../store/CVContext';
import './ThemeToggle.css';

export const ThemeToggle = () => {
  const { cvData, toggleTheme } = useCVStore();
  const isDark = cvData.theme === 'dark';

  return (
    <button className="theme-toggle glass" onClick={toggleTheme} aria-label="Temayı Değiştir">
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 360 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        {isDark ? <Moon size={20} className="icon-moon" /> : <Sun size={20} className="icon-sun" />}
      </motion.div>
      <span className="toggle-text">{isDark ? 'Koyu Tema' : 'Açık Tema'}</span>
    </button>
  );
};
