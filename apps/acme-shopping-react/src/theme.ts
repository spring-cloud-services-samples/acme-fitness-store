import {createTheme} from "@mui/material";
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/500.css'
export const theme = createTheme({
    typography: {
        allVariants: { color: "#c27baa" },
        fontFamily: [
            "Montserrat",
            "Helvetica",
            "Arial",
            'sans-serif',
        ].join(',')
    },
    palette: {
        mode: "light",
        text: {
            primary: "#212529"
        },
        primary: {
            contrastText: "#c27baa",
            main: "#fff",
        },
        secondary: {
            main: "#999",
            contrastText: "#212529"
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    ':root': {
                        colorScheme: 'light'
                    },
                    html: {
                        minHeight: '100%',
                    },
                    body: {
                        minHeight: '100%',
                        backgroundPosition: 'top right',
                        backgroundSize: '100%',
                    },
                },
            },
            MuiListItemButton: {
                defaultProps: {
                    disableRipple: true,
                },
            },
            MuiButton: {
                defaultProps: {
                    disableRipple: true,
                },
                styleOverrides: {
                    root: {
                        boxShadow: 'none',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        boxShadow: 'none',
                    },
                },
            },
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none'
                        },
                        '& .MuiDataGrid-cell:focus-within': {
                            outline: 'none'
                        }
                    },
                }
            },
        }
    }
})
