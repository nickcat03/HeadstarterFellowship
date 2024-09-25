// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Change to your desired primary color
        },
        secondary: {
            main: '#dc004e', // Change to your desired secondary color
        },
        background: {
            default: '#28364c'
        }
    },
});

export default theme;
