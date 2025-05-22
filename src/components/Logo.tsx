
import React from "react";

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
        S24
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Sweat24
      </span>
    </div>
  );
};

export default Logo;
