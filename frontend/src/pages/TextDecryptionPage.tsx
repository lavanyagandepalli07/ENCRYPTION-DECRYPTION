import React, { useState } from 'react';
import { textService } from '../services/api';
import { Unlock, Copy, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TextDecryptionPage = () => {
  const [encryptedText, setEncryptedText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [decryptedText, setDecryptedText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDecryptedText('');

    if (!encryptedText.trim()) { setError('Please enter the encrypted text.'); return; }
    if (passphrase.length < 8) { setError('Passphrase must be at least 8 characters long.'); return; }

    try {
      setLoading(true);
      const response = await textService.decryptText(encryptedText, passphrase);
      setDecryptedText(response.decryptedText);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Decryption failed. Invalid passphrase or corrupted data.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(decryptedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setEncryptedText('');
    setPassphrase('');
    setDecryptedText('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <Link to="/" className="flex items-center text-purple-400 hover:text-purple-300 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          <div className="flex items-center mb-8 pb-6 border-b border-gray-700">
            <div className="p-3 bg-purple-500/20 rounded-xl mr-4 border border-purple-500/20">
              <Unlock className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Text Decryption
              </h1>
              <p className="text-gray-400 mt-1 text-sm">Decrypt your secure AES-256-GCM messages.</p>
            </div>
          </div>

          <form onSubmit={handleDecrypt} className="space-y-5">
            {/* Encrypted Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Encrypted Text (Base64)</label>
              <textarea
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-100 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-32 resize-none placeholder-gray-600"
                placeholder="Paste the encrypted Base64 string here..."
                value={encryptedText}
                onChange={(e) => setEncryptedText(e.target.value)}
                required
              />
            </div>

            {/* Passphrase with visibility toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Decryption Passphrase</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Unlock className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-12 py-3 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm placeholder-gray-600"
                  placeholder="Enter the original passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  required
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !encryptedText.trim() || passphrase.length < 8}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Decrypting...</>
                ) : (
                  <><Unlock className="w-5 h-5" /> Decrypt Text</>
                )}
              </button>
              {(encryptedText || decryptedText) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-semibold transition-all text-sm"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {/* Decrypted Result */}
          {decryptedText && (
            <div className="mt-8 pt-8 border-t border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <label className="text-sm font-semibold text-emerald-400">Decrypted Plain Text</label>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center text-sm text-gray-400 hover:text-white transition-colors bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="w-full bg-gray-900 border border-emerald-500/30 rounded-xl p-4 text-gray-100 min-h-[8rem] whitespace-pre-wrap text-sm leading-relaxed">
                {decryptedText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextDecryptionPage;
