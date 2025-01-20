import { createTheme} from '@mui/material/styles';

// Define a custom theme for consistent styling
const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2', // Primary green color
      },
      secondary: {
        main: '#ff9800', // Secondary orange color
      },
    },
    typography: {
      fontFamily: 'Poppins, Arial, sans-serif', // Updated font family
      h6: {
        fontWeight: 700, // Bolder headers for emphasis
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6, // Improved readability for body text
      },
    },
  });
  export default theme;