import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img
        src="/logo-dark.png"
        alt="Sweat24 Logo"
        className="h-12 w-auto block dark:hidden"
      />
      <img
        src="/logo-light.png"
        alt="Sweat24 Logo"
        className="h-12 w-auto hidden dark:block"
      />
    </Link>
  );
};

export default Logo; 