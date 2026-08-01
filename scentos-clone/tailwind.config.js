/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        matte:'#080806', obsidian:'#111110', obsidian2:'#191917', obsidian3:'#222220',
        gold:{ DEFAULT:'#C9A24B', soft:'#D9BD7A', pale:'#EDD99A', dim:'#8F7033' },
        electric:{ DEFAULT:'#4F8CFF', soft:'#7FA9FF', dim:'#2B5CCC' },
        bone:'#EDE8DF', ash:'#9C9488', ember:'#D4644A',
      },
      fontFamily: { display:['var(--font-fraunces)'], body:['var(--font-inter)'], mono:['var(--font-jetbrains)'] },
      fontSize: { '2xs':['0.65rem',{lineHeight:'1rem'}] },
      backgroundImage: { 'radial-gold':'radial-gradient(ellipse at 50% 0%, rgba(201,162,75,0.15), transparent 60%)' },
      boxShadow: { glass:'0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(237,232,223,0.04)', gold:'0 0 24px rgba(201,162,75,0.25)' },
    },
  },
  plugins: [],
};
