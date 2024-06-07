import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
    components: {
        MuiTab: {
            styleOverrides: {
                root: {
                    color: 'gray',
                },
            },
        },
    },
});

export default theme;
