import { FC, useEffect, useMemo } from 'react';
import { Navigate, Route, Router, Routes } from 'react-router-dom';
import { initNavigator, useMiniApp, useViewport } from '@tma.js/sdk-react';
import { useIntegration } from '@tma.js/react-router-integration';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { routes } from '@/constants/routes.ts';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { AppProvider } from '@/context/app-context.tsx';
import TabsNavigation from './TabsNavigation';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

const ErrorBoundaryError: FC<{ error: unknown }> = ({ error }) => (
    <div>
        <p>An unhandled error occurred:</p>
        <blockquote>
            <code>
                {error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error)}
            </code>
        </blockquote>
    </div>
);

function App() {
    const miniApp = useMiniApp();
    const viewport = useViewport();

    const navigator = useMemo(() => initNavigator('app-navigation-state'), []);
    const [location, reactNavigator] = useIntegration(navigator);

    useEffect(() => {
        navigator.attach();
        return () => navigator.detach();
    }, [navigator]);

    useEffect(() => {
        miniApp.ready();
        miniApp.setBgColor('#161C24');
        miniApp.setHeaderColor('#161C24');
        viewport?.expand();
    }, [miniApp, viewport]);

    const manifestUrl = useMemo(() => {
        return new URL('tonconnect-manifest.json', window.location.href).toString();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <ErrorBoundary fallback={ErrorBoundaryError}>
                <TonConnectUIProvider
                    manifestUrl={manifestUrl}
                    actionsConfiguration={{
                        twaReturnUrl: 'https://t.me/tma_jetton_processing_bot/tma_jetton_processing',
                    }}
                >
                    <AppProvider>
                        <Router location={location} navigator={reactNavigator}>
                            <TabsNavigation />
                            <Routes>
                                {routes.map((route) => (
                                    <Route key={route.path} {...route} />
                                ))}
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </Router>
                    </AppProvider>
                </TonConnectUIProvider>
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;
