import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Navbar />
      <main className="content">
        <Outlet /> {/* Ini ganti posisi children */}
      </main>
    </div>
  );
};

export default Layout;
