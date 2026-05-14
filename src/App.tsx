import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Practice } from './pages/Practice';
import { Path } from './pages/Path';
import { Profile } from './pages/Profile';
import { Assistant } from './pages/Assistant';
import { Teacher } from './pages/Teacher';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="practice" element={<Practice />} />
          <Route path="path" element={<Path />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="teacher" element={<Teacher />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
