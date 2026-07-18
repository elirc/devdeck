import { useEffect } from 'react';
import { useStore } from './store';
import { Home } from './screens/Home';
import { Session } from './screens/Session';
import { Summary } from './screens/Summary';
import { Stats } from './screens/Stats';
import { Settings } from './screens/Settings';
import type { Route } from './store';

const NAV: { route: Route; label: string }[] = [
  { route: 'home', label: 'Home' },
  { route: 'stats', label: 'Stats' },
  { route: 'settings', label: 'Settings' },
];

function App() {
  const ready = useStore(s => s.ready);
  const route = useStore(s => s.route);
  const theme = useStore(s => s.settings.theme);
  const updateApp = useStore(s => s.updateApp);
  const setRoute = useStore(s => s.setRoute);

  useEffect(() => {
    void useStore.getState().init();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light');
  }, [theme]);

  if (!ready) {
    return (
      <div className="app">
        <div className="loading">DevDeck</div>
      </div>
    );
  }

  let screen;
  switch (route) {
    case 'session':
      screen = <Session />;
      break;
    case 'summary':
      screen = <Summary />;
      break;
    case 'stats':
      screen = <Stats />;
      break;
    case 'settings':
      screen = <Settings />;
      break;
    default:
      screen = <Home />;
  }

  return (
    <div className="app">
      {screen}
      {route !== 'session' && (
        <nav className="bottom-nav">
          {NAV.map(item => (
            <button
              key={item.route}
              type="button"
              className={`nav-btn${route === item.route ? ' active' : ''}`}
              onClick={() => setRoute(item.route)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
      {updateApp !== null && (
        <div className="update-toast">
          <span>A new version is ready.</span>
          <button type="button" onClick={updateApp}>
            Reload
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
