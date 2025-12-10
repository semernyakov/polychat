declare global {
  interface Window {
    app: import('obsidian').App | undefined;
  }
}

export {};
