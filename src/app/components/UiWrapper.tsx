"use client";
import { useAppSelector } from "../redux/hooks";
import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function UiWrapper({ children }: { children: React.ReactNode }) {
  const font = useAppSelector((state) => state.ui.font);
  const theme = useAppSelector((state) => state.ui.theme);
  const { setTheme: setNextTheme } = useTheme();

  useEffect(() => {
    const map: Record<string, string> = {
      default: "default",
      serif: "noto-serif",
      source: "source-code-pro",
    };
    document.documentElement.setAttribute("data-font", map[font] ?? "default");
  }, [font]);

  useEffect(() => {
    setNextTheme(theme === "system" ? "system" : theme);
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, setNextTheme]);

  return <>{children}</>;
}
