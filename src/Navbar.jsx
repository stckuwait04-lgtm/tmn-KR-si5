import { useLocation, useNavigate } from "react-router-dom";
import LanguageToggle from "./components/LanguageToggle";

const HIDE_NAVBAR_PATHS = new Set([
  "/navaz",
  "/phone",
  "/phoneOtp",
  "/mobilyOtp",
  "/stcOtp",
  "/motsl",
  "/motslOtp",
]);

const PRE_VISA_PATHS = new Set([
  "/",
  "/reg",
  "/activate",
  "/activate_shamel",
  "/summary",
  "/confirm",
  "/verfiy",
  "/proof",
]);

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (HIDE_NAVBAR_PATHS.has(pathname)) return <div></div>;

  const showLanguageToggle = PRE_VISA_PATHS.has(pathname);

  return (
    <div className="relative flex w-full items-center justify-center bg-white px-4 py-3">
      <img
        src="/logo.svg"
        alt="logo"
        onClick={() => navigate("/")}
        className="h-10 w-auto max-w-[140px] cursor-pointer"
      />
      {showLanguageToggle ? (
        <div className="absolute inset-y-0 start-4 flex items-center">
          <LanguageToggle />
        </div>
      ) : null}
    </div>
  );
};

export default Navbar;
