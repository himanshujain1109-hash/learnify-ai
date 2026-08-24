import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => { logout(); navigate('/'); };
  return <header className="nav"><div className="nav-inner">
    <Link className="brand" to="/"><span className="brand-mark">L</span><span>Learnify <b>AI</b></span></Link>
    <nav className="nav-links">
      {user ? <>
        <Link to="/dashboard">Dashboard</Link><Link to="/upload">Study Material</Link><Link to="/notes-to-video">Notes → Video</Link>
        <span className="nav-user">Hi, {user.name?.split(' ')[0]}</span><button className="nav-logout" onClick={signOut}>Logout</button>
      </> : <><Link to="/login">Log in</Link><Link className="nav-cta" to="/register">Get Started</Link></>}
    </nav>
  </div></header>;
}
