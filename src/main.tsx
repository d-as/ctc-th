import { StrictMode, useState } from 'react'
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppContext } from './AppContext';
import './index.scss';

const Root = (): JSX.Element => {
  const [showTransposedGrid, setShowTransposedGrid] = useState(false);

  return (
    <AppContext.Provider value={{ showTransposedGrid, setShowTransposedGrid }}>
      <App />
    </AppContext.Provider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
