/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LiveStatus from './views/LiveStatus';
import CivicDashboard from './views/CivicDashboard';
import ChatTerminal from './views/ChatTerminal';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/live" replace />} />
          <Route path="live" element={<LiveStatus />} />
          <Route path="dashboard" element={<CivicDashboard />} />
          <Route path="chat" element={<ChatTerminal />} />
          <Route path="voter-id" element={<div className="flex items-center justify-center h-full text-zinc-500 font-space uppercase tracking-[0.4em]">Section under development</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
