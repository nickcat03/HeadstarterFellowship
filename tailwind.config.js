/** @type {import('tailwindcss').Config} */
module.exports = {
 
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#182539",
        secondary: "#00dfc3",
      },
    },
    plugins: [],
  }

}

