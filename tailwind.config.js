/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        gray: {
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        orange: {
          500: '#FF5C00',
          600: '#E05200',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.gray.300'),
              '&:hover': {
                color: theme('colors.white'),
              },
            },
            h1: {
              color: theme('colors.white'),
              fontWeight: '500',
            },
            h2: {
              color: theme('colors.white'),
              fontWeight: '500',
            },
            h3: {
              color: theme('colors.white'),
              fontWeight: '500',
            },
            h4: {
              color: theme('colors.white'),
              fontWeight: '500',
            },
            strong: {
              color: theme('colors.white'),
            },
            code: {
              color: theme('colors.white'),
            },
            blockquote: {
              color: theme('colors.gray.300'),
              borderLeftColor: theme('colors.gray.800'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}; 