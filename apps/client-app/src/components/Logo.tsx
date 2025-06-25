import React from "react";
import { useTheme } from "next-themes";

const Logo: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center">
      <img 
        src={theme === 'dark' ? '/logo-light.png' : '/logo-dark.png'} 
        alt="Sweat24 Logo" 
        className="h-14" 
      />
    </div>
  );
};

export default Logo;
