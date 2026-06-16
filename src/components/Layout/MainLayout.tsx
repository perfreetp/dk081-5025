import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

export default function MainLayout() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<"fadeIn" | "fadeOut">(
    "fadeIn"
  );

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === "fadeOut") {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, location]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-primary-50">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div
            className={
              transitionStage === "fadeIn"
                ? "animate-fade-in-up"
                : "opacity-0 -translate-y-1 transition-all duration-120 ease-in"
            }
            key={displayLocation.pathname}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
