import { Link } from "react-router-dom";
import clsx from "clsx";

interface LogoProps {
  to?: string;
  className?: string;
  disableLink?: boolean;
}

const Logo: React.FC<LogoProps> = ({ to = "/", className = "", disableLink = false }) => {
  const content = (
    <>
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
    </>
  );

  if (disableLink) {
    return <div className={clsx("flex items-center gap-2", className)}>{content}</div>;
  }

  return (
    <Link to={to} className={clsx("flex items-center gap-2", className)}>
      {content}
    </Link>
  );
};

export default Logo;
