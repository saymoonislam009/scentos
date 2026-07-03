/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ScentOS palette — matte black base, obsidian glass surfaces,
        // gold for luxury/heritage cues, electric blue for AI-native moments.
        matte: '#050505',
        obsidian: '#15151A',
        obsidian2: '#1D1D24',
        gold: {
          DEFAULT: '#C9A24B',
          soft: '#D9BD7A',
        },
        electric: {
          DEFAULT: '#4F8CFF',
          soft: '#7FA9FF',
        },
        bone: '#EDEAE3',
        ash: '#9C9892',
      },
      fontFamily: {
        display: ['var(--font-fraunces)'],
        body: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains)'],
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(circle at 50% 30%, rgba(79,140,255,0.10), transparent 60%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
};
