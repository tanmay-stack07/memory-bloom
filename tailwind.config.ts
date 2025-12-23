import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Maith custom colors
        cream: {
          DEFAULT: "hsl(var(--cream))",
          dark: "hsl(var(--cream-dark))",
        },
        film: {
          grain: "hsl(var(--film-grain))",
        },
        polaroid: {
          white: "hsl(var(--polaroid-white))",
        },
        paper: {
          kraft: "hsl(var(--paper-kraft))",
          vintage: "hsl(var(--paper-vintage))",
        },
        ink: {
          warm: "hsl(var(--ink-warm))",
        },
        shadow: {
          soft: "hsl(var(--shadow-soft))",
        },
        glow: {
          warm: "hsl(var(--glow-warm))",
        },
        mood: {
          memory: "hsl(var(--mood-memory))",
          joy: "hsl(var(--mood-joy))",
          night: "hsl(var(--mood-night))",
          analog: "hsl(var(--mood-analog))",
          candle: "hsl(var(--mood-candle))",
          carefree: "hsl(var(--mood-carefree))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        'soft': '0 2px 8px hsl(var(--shadow-soft) / 0.08), 0 4px 16px hsl(var(--shadow-soft) / 0.06)',
        'soft-lg': '0 4px 12px hsl(var(--shadow-soft) / 0.1), 0 8px 32px hsl(var(--shadow-soft) / 0.08)',
        'soft-xl': '0 8px 24px hsl(var(--shadow-soft) / 0.12), 0 16px 48px hsl(var(--shadow-soft) / 0.1)',
        'glow': '0 0 20px hsl(var(--glow-warm) / 0.3)',
        'glow-lg': '0 0 40px hsl(var(--glow-warm) / 0.4)',
        'inner-soft': 'inset 0 2px 8px hsl(var(--shadow-soft) / 0.08)',
        'polaroid': '0 2px 8px hsl(var(--shadow-soft) / 0.1), 0 8px 32px hsl(var(--shadow-soft) / 0.12), 0 16px 48px hsl(var(--shadow-soft) / 0.08)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(1deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.02)", opacity: "0.95" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "ripple": {
          "0%": { transform: "scale(0.8)", opacity: "0.5" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-gentle": "float-gentle 4s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-in": "fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "scale-in": "scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "slide-up": "slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "wiggle": "wiggle 3s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "ripple": "ripple 1.5s ease-out infinite",
      },
      transitionDuration: {
        'slow': '600ms',
        'gentle': '400ms',
      },
      transitionTimingFunction: {
        'gentle': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
