import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Path } from './pages/Path';
import { Profile } from './pages/Profile';
import { Assistant } from './pages/Assistant';
import { Teacher } from './pages/Teacher';
import { Lessons } from './pages/Lessons';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="path" element={<Path />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="teacher" element={<Teacher />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
