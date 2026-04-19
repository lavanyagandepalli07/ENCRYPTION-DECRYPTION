import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Lock, ArrowLeft, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';

const FileEncryptionPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError('Please select a file to encrypt.');
      return;
    }

    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters long.');
      return;
    }

    if (passphrase !== confirmPassphrase) {
      setError('Passphrases do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('passphrase', passphrase);

      const response = await api.post('/encrypt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setSuccess(response.data);
      setFile(null);
      setPassphrase('');
      setConfirmPassphrase('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to encrypt file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-emerald-500/20 rounded-xl mr-4">
              <FileUp className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Encrypt File</h1>
              <p className="text-gray-400">Secure your files with AES-256-GCM encryption</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start text-red-400">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-6 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex flex-col items-center text-center">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mb-3" />
              <h3 className="text-xl font-bold text-emerald-400 mb-2">Encryption Successful</h3>
              <p className="text-gray-300 mb-4">Your file has been securely encrypted and stored.</p>
              <div className="bg-gray-900 p-4 rounded-lg w-full text-left font-mono text-sm break-all border border-gray-700">
                <p><span className="text-gray-500">File ID:</span> {success.fileId}</p>
                <p><span className="text-gray-500">File Name:</span> {success.fileName}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleEncrypt} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select File
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Encryption Passphrase
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter a strong passphrase (min 8 characters)"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Confirm Passphrase
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Confirm your passphrase"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-gray-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !file || !passphrase}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Encrypting...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Encrypt File
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileEncryptionPage;
