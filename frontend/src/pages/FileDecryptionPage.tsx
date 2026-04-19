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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-teal-500/20 rounded-xl mr-4 border border-teal-500/20">
              <FileDown className="w-8 h-8 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Decrypt File</h1>
              <p className="text-gray-400 text-sm">Recover your files securely from the vault</p>
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
              <label className="block text-sm font-medium text-gray-400 mb-2">File ID</label>
              <input
                type="text"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
                placeholder="Paste the UUID of the encrypted file"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-mono placeholder-gray-600 text-sm"
              />
            </div>

            {/* Passphrase with toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Decryption Passphrase</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Unlock className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter the passphrase used for encryption"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-12 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all placeholder-gray-600 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassphrase ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {isLoading && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Downloading & decrypting...</span>
                  {progress > 0 && <span>{progress}%</span>}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: progress > 0 ? `${progress}%` : '30%', animation: progress === 0 ? 'pulse 1.5s ease-in-out infinite' : 'none' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !fileId || !passphrase}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_-5px_rgba(20,184,166,0.6)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Decrypting & Downloading...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Decrypt & Download File
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
