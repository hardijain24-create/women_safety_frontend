/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // New design-system tokens (2026 redesign) - mirrors src/theme/colors.ts
        'background': '#F8FAF8',
        'backgroundSecondary': '#F1F5F2',
        'surface': '#FFFFFF',
        'card': '#FFFFFF',
        'primary': {
          DEFAULT: '#17C964',
          light: '#5CE27F',
          dark: '#0FA854',
        },
        'secondary': '#5CE27F',
        'danger': '#FF4D5A',
        'success': '#2ECC71',
        'warning': '#F5B942',
        'info': '#3B82F6',
        'text': {
          primary: '#1B1B1B',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        'border-subtle': '#E7ECEA',
        'divider': '#E7ECEA',
        'overlay': 'rgba(27, 27, 27, 0.5)',

        // Legacy palette - kept for compatibility, remapped onto the new
        // green/gray/red palette so old class names don't render out-of-place
        // colors if something still references them. All unused today (no
        // component in this codebase uses `className`) - safe either way.
        'navy': {
          DEFAULT: '#1B1B1B',
          light: '#374151',
          dark: '#111827',
        },
        'beige': {
          DEFAULT: '#F8FAF8',
          light: '#FFFFFF',
          dark: '#F1F5F2',
        },
        'cream': {
          DEFAULT: '#FFFFFF',
          light: '#FFFFFF',
          dark: '#F3F4F6',
        },
        'slate': {
          DEFAULT: '#6B7280',
          light: '#9CA3AF',
          dark: '#4B5563',
        },
        'sage': {
          DEFAULT: '#5CE27F',
          light: '#8FF0A6',
          dark: '#17C964',
        },
        'coral': {
          DEFAULT: '#FF4D5A',
          light: '#FF6672',
          dark: '#E63946',
        },
        'warm-gray': {
          DEFAULT: '#6B7280',
          light: '#9CA3AF',
          dark: '#4B5563',
        },
        'gold': {
          DEFAULT: '#5CE27F',
          light: '#8FF0A6',
          dark: '#17C964',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#8FF0A6',
          400: '#5CE27F',
          500: '#17C964',
          600: '#0FA854',
          700: '#0C8A45',
          800: '#0A6E37',
          900: '#08582C',
        },
        'charcoal': {
          DEFAULT: '#1B1B1B',
          light: '#374151',
          dark: '#111827',
        },
      },
      fontFamily: {
        'sans': ['System', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.625rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      // Additive only - do NOT override Tailwind's core numeric spacing
      // scale (1-8 already mean 4/8/12/16/20/24/28/32px). Overriding those
      // would silently change what p-6, gap-8, etc. mean everywhere.
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-5': '20px',
        'space-6': '24px',
        'space-7': '32px',
      },
      borderRadius: {
        // Aligned to borderRadius scale in src/theme/colors.ts.
        // Note: this overrides Tailwind's default sm/md/lg/xl/2xl values
        // (normally 2/6/8/12/16px) with larger app-specific values. Safe
        // today since nothing uses className, but be aware if className
        // adoption starts and some third-party component expects defaults.
        'sm': '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '28px',
        '2xl': '36px',
        '3xl': '48px',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(15, 23, 42, 0.05)',
        'soft-lg': '0 10px 35px rgba(15, 23, 42, 0.08)',
        'glass': '0 8px 30px rgba(15, 23, 42, 0.06)',
        'success': '0 6px 20px rgba(23, 201, 100, 0.18)',
        'danger': '0 6px 20px rgba(255, 77, 90, 0.18)',
        'gold': '0 4px 20px rgba(23, 201, 100, 0.25)',
      },
      zIndex: {
        'header': '20',
        'fab': '50',
        'overlay': '90',
        'modal': '100',
        'toast': '110',
        'sos': '999',
      },
    },
  },
  plugins: [],
}