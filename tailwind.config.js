/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/**.{html,js}"],
  theme: {
    fontFamily:{
      'sans':['Poppins', 'sans-serif']

    },
    extend: {
      backgroundImage:{
        "home-pc":"url('/assets/bannerpc.png')",
        "home-mobile":"url('/assets/bannermobileteste.png')"
        
      }
    },
  },
  plugins: [],
}

