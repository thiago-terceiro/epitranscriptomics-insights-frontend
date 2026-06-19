"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export type ThemeProviderProps = React.ComponentProps<
  typeof NextThemesProvider
>;

const DEFAULT_THEMES: ThemeProviderProps["themes"] = [
  "light",
  "dark",
  "mint",
  "blush",
  "lavender",
  "sky",
  "peach",
  "sand",
];

const ThemeProvider = ({
  children,
  themes = DEFAULT_THEMES,
  ...props
}: ThemeProviderProps) => {
  return (
    <NextThemesProvider themes={themes} {...props}>
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;
