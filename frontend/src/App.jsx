import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Material from "./pages/Material";
import Lesson from "./pages/Lesson";
import Tutor from "./pages/Tutor";
import Quiz from "./pages/Quiz";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/materials/:id" element={<ProtectedRoute><Material /></ProtectedRoute>} />
          <Route path="/lessons/:id" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
          <Route path="/tutor/:documentId" element={<ProtectedRoute><Tutor /></ProtectedRoute>} />
          <Route path="/quiz/:lessonId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}