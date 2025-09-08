import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { WikiProvider } from './contexts/WikiContext';
import EditPage from './pages/EditPage';
import HomePage from './pages/HomePage';
import OrderPage from './pages/OrderPage';
import SettingsPage from './pages/SettingsPage';
import WikiPage from './pages/WikiPage';

function App() {
  return (
    <WikiProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/edit/*" element={<EditPage />} />
            <Route path="/order/*" element={<OrderPage />} />
            <Route path="/wiki/*" element={<WikiPage />} />
          </Routes>
        </Layout>
      </Router>
    </WikiProvider>
  );
}

export default App;
