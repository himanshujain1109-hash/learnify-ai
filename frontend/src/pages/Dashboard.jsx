import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMaterials } from '../services/materials';
import MaterialCard from '../components/MaterialCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth(); const [materials,setMaterials]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  useEffect(()=>{getMaterials().then(d=>setMaterials(d.materials||[])).catch(e=>setError(e.response?.data?.message||'Could not load your materials.')).finally(()=>setLoading(false));},[]);
  return <div className="dashboard">
    <section className="dash-hero"><div><span className="eyebrow">YOUR LEARNING SPACE</span><h1>Welcome back, {user?.name?.split(' ')[0] || 'Learner'} 👋</h1><p>Pick up where you left off or add something new to learn.</p></div><Link className="btn btn-large" to="/upload">+ Add material</Link></section>
    <div className="dashboard-stats"><div><span>📚</span><b>{materials.length}</b><small>Study materials</small></div><div><span>✦</span><b>AI</b><small>Tutor available</small></div><div><span>✓</span><b>∞</b><small>Practice anytime</small></div></div>
    <div className="section-heading compact"><div><span className="eyebrow">MY LIBRARY</span><h2>Recent study material</h2></div><Link className="text-link" to="/upload">Upload new →</Link></div>
    {error&&<div className="error">{error}</div>}{loading?<Loader/>:materials.length?<div className="grid material-grid">{materials.map(m=><MaterialCard key={m._id} material={m}/>)}</div>:<div className="empty-state"><div className="empty-icon">✦</div><h3>Your library is ready for its first lesson.</h3><p>Upload a PDF, DOCX or TXT file and Learnify AI will turn it into topics you can actually study.</p><Link className="btn" to="/upload">Upload my first material →</Link></div>}
  </div>;
}
