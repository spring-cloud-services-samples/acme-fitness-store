import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import React, {ReactNode} from "react";
import {CssBaseline, ThemeProvider} from '@mui/material';
import {theme} from './theme.ts'

interface Props {
    children?: ReactNode;
}

export default function AppProvider({children}: Readonly<Props>) {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme/>
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    );
}
