import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Link, useLocation, matchPath } from 'react-router-dom';

function useRouteMatch(patterns: readonly string[]) {
    const { pathname } = useLocation();

    for (let i = 0; i < patterns.length; i += 1) {
        const pattern = patterns[i];
        const possibleMatch = matchPath(pattern, pathname);
        if (possibleMatch !== null) {
            return possibleMatch;
        }
    }

    return null;
}

function AppTabs() {
    const routeMatch = useRouteMatch(['/', '/cart', '/transactions-history', '/transaction-sent']);
    const currentTab = routeMatch?.pattern?.path;

    return (
        <Tabs value={currentTab}>
            <Tab label="Main" value="/" to="/" component={Link} />
            <Tab label="Cart" value="/cart" to="/cart" component={Link} />
            <Tab label="History" value="/transactions-history" to="/transactions-history" component={Link} />
            <Tab label="Success" value="/transaction-sent" to="/transaction-sent" component={Link} />
        </Tabs>
    );
}

const TabsNavigation = () => (
    <Box sx={{ width: '100%' }}>
        <AppTabs />
    </Box>
);

export default TabsNavigation;
