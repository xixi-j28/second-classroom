import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Home from './pages/Home';
import Students from './pages/Students';
import Activities from './pages/Activities';
import Transcript from './pages/Transcript';
import Reports from './pages/Reports';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="students" element={<Students />} />
        <Route path="activities" element={<Activities />} />
        <Route path="transcript" element={<Transcript />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
};

export default App;
