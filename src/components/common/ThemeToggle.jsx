import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button className="theme-toggle" onClick={() => setDark(d => !d)} title={dark ? 'Karanlık Mod' : 'Açık Mod'}>
      {dark ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle; 