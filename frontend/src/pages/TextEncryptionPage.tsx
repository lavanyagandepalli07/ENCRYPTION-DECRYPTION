import React, { useState } from 'react';
import { textService } from '../services/api';
import { Lock, Copy, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PassphraseStrength from '../components/PassphraseStrength';

const TextEncryptionPage = () => {
  const [text, setText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [encryptedText, setEncryptedText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!text.trim()) { setError('Please enter text to encrypt.'); return; }
    if (passphrase.length < 8) { setError('Passphrase must be at least 8 characters long.'); return; }

    try {
      setLoading(true);
      const response = await textService.encryptText(text, passphrase);
      setEncryptedText(response.encryptedTextBase64);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to encrypt text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(encryptedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setText('');
    setPassphrase('');
    setEncryptedText('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <Link to="/" className="flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          <div className="flex items-center mb-8 pb-6 border-b border-gray-700">
            <div className="p-3 bg-blue-500/20 rounded-xl mr-4 border border-blue-500/20">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Text Encryption
              </h1>
              <p className="text-gray-400 mt-1 text-sm">Secure your sensitive text messages with AES-256-GCM.</p>
            </div>
          </div>

          <form onSubmit={handleEncrypt} className="space-y-5">
            {/* Plain Text Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">Plain Text</label>
                <span className="text-xs text-gray-500">{text.length} characters</span>
              </div>
              <textarea
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none text-sm placeholder-gray-600"
                placeholder="Enter the text you want to encrypt..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>

            {/* Passphrase with visibility toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Encryption Passphrase</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-12 py-3 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder-gray-600"
                  placeholder="Must be at least 8 characters"
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
              <PassphraseStrength passphrase={passphrase} />
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
                disabled={loading || !text.trim() || passphrase.length < 8}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Encrypting...</>
                ) : (
                  <><Lock className="w-5 h-5" /> Encrypt Text</>
                )}
              </button>
              {(text || encryptedText) && (
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

          {/* Encrypted Result */}
          {encryptedText && (
            <div className="mt-8 pt-8 border-t border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <label className="text-sm font-semibold text-emerald-400">Encrypted Result (Base64)</label>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center text-sm text-gray-400 hover:text-white transition-colors bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea
                className="w-full bg-gray-900 border border-emerald-500/30 rounded-xl p-4 text-emerald-400 font-mono text-xs break-all h-32 focus:outline-none resize-none"
                value={encryptedText}
                readOnly
              />
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Save this ciphertext and your passphrase — you'll need both to decrypt.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextEncryptionPage;
