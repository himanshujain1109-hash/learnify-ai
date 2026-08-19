import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  ['01','Smart lessons','Turn dense notes and PDFs into clear, teacher-style explanations.'],
  ['02','AI Tutor','Ask questions about your own material and get focused answers.'],
  ['03','Practice quizzes','Test your understanding with instant, topic-based quizzes.'],
];

export default function Home() {
  const { user } = useAuth();
  return <div className="home">
    <section className="hero-home">
      <div className="hero-copy">
        <span className="eyebrow">✦ AI-POWERED STUDY COMPANION</span>
        <h1>Study less. <span>Understand more.</span></h1>
        <p>Learnify AI turns your study material into lessons, quizzes and a personal AI tutor — so you can focus on learning, not searching.</p>
        <div className="hero-actions"><Link className="btn btn-large" to={user ? '/dashboard' : '/register'}>{user ? 'Open my dashboard →' : 'Start learning free →'}</Link><Link className="text-link" to="/login">I already have an account</Link></div>
        <div className="trust-row"><span>✓ Simple explanations</span><span>✓ Exam-focused</span><span>✓ Learn at your pace</span></div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="glow-orb"></div><div className="study-card main-card">
          <div className="mini-top"><span className="live-dot"></span> Your learning space <span>•••</span></div>
          <div className="progress-label"><b>Data Structures</b><span>72%</span></div><div className="progress"><div style={{width:'72%'}}></div></div>
          <div className="ai-answer"><div className="ai-icon">✦</div><div><small>LEARNIFY AI</small><p>“A stack follows LIFO — like a stack of books. The last book you place is the first one you pick up.”</p></div></div>
          <div className="mock-grid"><div><small>QUIZ SCORE</small><b>8 / 10</b></div><div><small>TOPICS</small><b>12</b></div></div>
        </div>
        <div className="floating-pill pill-one">✦ AI Tutor ready</div><div className="floating-pill pill-two">✓ 3 topics mastered</div>
      </div>
    </section>
    <section className="stats"><div><b>3-in-1</b><span>learning toolkit</span></div><div><b>AI</b><span>powered explanations</span></div><div><b>24/7</b><span>study companion</span></div><div><b>1 place</b><span>for your material</span></div></section>
    <section className="section"><div className="section-heading"><span className="eyebrow">WHY LEARNIFY</span><h2>Everything you need to <span>learn smarter.</span></h2></div><div className="feature-grid">{features.map(([n,t,d])=><div className="feature-card" key={n}><span className="feature-num">{n}</span><div className="feature-icon">✦</div><h3>{t}</h3><p>{d}</p></div>)}</div></section>
    <section className="cta-section"><div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Make your next study session count.</h2><p>Upload your first material and let Learnify AI organize the hard work.</p></div><Link className="btn btn-large light-btn" to={user ? '/upload' : '/register'}>Try Learnify AI →</Link></section>
  </div>;
}
