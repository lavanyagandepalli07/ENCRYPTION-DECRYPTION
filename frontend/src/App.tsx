
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import TextEncryptionPage from './pages/TextEncryptionPage';
import TextDecryptionPage from './pages/TextDecryptionPage';
import FileEncryptionPage from './pages/FileEncryptionPage';
import FileDecryptionPage from './pages/FileDecryptionPage';
import AuditLogPage from './pages/AuditLogPage';
import SignFilePage from './pages/SignFilePage';
import VerifySignaturePage from './pages/VerifySignaturePage';
import CheckIntegrityPage from './pages/CheckIntegrityPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import SessionWarning from './components/SessionWarning';

function App() {
  return (
    <AuthProvider>
      <Router>
        <SessionWarning />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* All Routes now Public */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/text-encrypt" element={<TextEncryptionPage />} />
          <Route path="/text-decrypt" element={<TextDecryptionPage />} />
          <Route path="/file-encrypt" element={<FileEncryptionPage />} />
          <Route path="/file-decrypt" element={<FileDecryptionPage />} />
          <Route path="/sign-file" element={<SignFilePage />} />
          <Route path="/verify-signature" element={<VerifySignaturePage />} />
          <Route path="/check-integrity" element={<CheckIntegrityPage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
