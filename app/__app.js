// pages/_app.js or _app.tsx
import { ThemeProvider } from '@mui/material/styles';
import theme from '../src/theme'; // Adjust path if necessary

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
