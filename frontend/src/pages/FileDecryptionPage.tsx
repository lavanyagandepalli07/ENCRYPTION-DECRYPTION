import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileDown, Unlock, ArrowLeft, Loader2, Download, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const FileDecryptionPage = () => {
  const [fileId, setFileId] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fileId.trim()) { setError('Please enter a valid File ID.'); return; }
    if (passphrase.length < 8) { setError('Passphrase must be at least 8 characters long.'); return; }

    setShowConfirm(true);
  };

  const handleDecrypt = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    setProgress(0);

    try {
      const response = await api.post(
        `/decrypt/${fileId}`,
        { passphrase },
        {
          responseType: 'blob',
          headers: { 'Content-Type': 'application/json' },
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(pct);
            }
          },
        }
      );

      // Extract filename from Content-Disposition header
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'decrypted_file';
      if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setFileId('');
      setPassphrase('');
      setProgress(0);
    } catch (err: any) {
      if (err.response && err.response.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const jsonError = JSON.parse(text);
          setError(jsonError.error || 'Failed to decrypt file. Check your passphrase.');
        } catch {
          setError('Failed to decrypt file. Check your File ID and passphrase.');
        }
      } else {
        setError(err.response?.data?.error || 'Failed to decrypt file. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-slide-up flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <Link to="/" className="inline-flex items-center text-blue-900/40 hover:text-blue-600 mb-8 transition-all group font-bold text-sm tracking-widest uppercase">
          <div className="p-2 bg-blue-50 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors border border-blue-100">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Return to Infrastructure
        </Link>

        <div className="glass rounded-[2.5rem] p-6 sm:p-12 border-blue-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
          
          <div className="flex items-center mb-10 pb-8 border-b border-blue-100 relative z-10">
            <div className="p-5 bg-blue-100 rounded-3xl border border-blue-200 shadow-xl shadow-blue-500/5">
              <FileDown className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-blue-950 mb-1">Decrypt File</h1>
              <p className="text-blue-900/40 font-bold tracking-tight uppercase text-xs">Recover your files securely from the vault</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start text-red-400">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* File ID */}
            <div>
              <label className="text-xs font-bold text-blue-900/40 uppercase tracking-[0.2em] ml-1 block mb-2">File ID</label>
              <input
                type="text"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
                placeholder="Paste the UUID of the encrypted file"
                className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-4 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all font-mono placeholder-blue-900/20 text-sm font-bold"
              />
            </div>

            {/* Passphrase with toggle */}
            <div>
              <label className="text-xs font-bold text-blue-900/40 uppercase tracking-[0.2em] ml-1 block mb-2">Decryption Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                  <Unlock className="w-5 h-5 text-blue-300 group-focus-within:text-blue-500" />
                </div>
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter the passphrase used for encryption"
                  className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl pl-12 pr-12 py-4 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all font-bold placeholder-blue-900/20 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-blue-300 hover:text-blue-500 transition-colors"
                >
                  {showPassphrase ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {isLoading && (
              <div className="animate-fade-in pt-4">
                <div className="flex justify-between text-[10px] font-bold text-blue-900/40 uppercase tracking-widest mb-3">
                  <span>Downloading & decrypting...</span>
                  {progress > 0 && <span className="text-blue-600">{progress}%</span>}
                </div>
                <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden border border-blue-200">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-300"
                    style={{ width: progress > 0 ? `${progress}%` : '30%', animation: progress === 0 ? 'pulse 1.5s ease-in-out infinite' : 'none' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !fileId || !passphrase}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-blue-600/20 hover:shadow-blue-600/40 group active:scale-[0.98] text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Processing Asset...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-3" />
                  Decrypt & Download Resource
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm Decryption"
        message={`Decrypt file with ID "${fileId.slice(0, 12)}..."? The decrypted file will be downloaded to your device.`}
        confirmLabel="Yes, Decrypt & Download"
        onConfirm={handleDecrypt}
        onCancel={() => setShowConfirm(false)}
        variant="info"
      />
    </div>
  );
};

export default FileDecryptionPage;
