import React, { useState } from 'react';
import { textService } from '../services/api';
import { Lock, Copy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TextEncryptionPage = () => {
  const [text, setText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await textService.encryptText(text, passphrase);
      setEncryptedText(response.encryptedTextBase64);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to encrypt text.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(encryptedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <Link to="/" className="flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          <div className="flex items-center mb-8 pb-6 border-b border-gray-700">
            <div className="p-3 bg-blue-500/20 rounded-lg mr-4">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Text Encryption
              </h1>
              <p className="text-gray-400 mt-1">Secure your sensitive text messages with AES-256-GCM.</p>
            </div>
          </div>

          <form onSubmit={handleEncrypt} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Plain Text</label>
              <textarea
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32"
                placeholder="Enter the text you want to encrypt..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Encryption Passphrase</label>
              <input
                type="password"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Must be at least 8 characters"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-semibold shadow-lg transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Encrypting...' : 'Encrypt Text'}
            </button>
          </form>

          {encryptedText && (
            <div className="mt-8 pt-8 border-t border-gray-700 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-green-400">Encrypted Result (Base64)</label>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center text-sm text-gray-400 hover:text-white transition-colors bg-gray-900 px-3 py-1.5 rounded-md border border-gray-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </button>
              </div>
              <textarea
                className="w-full bg-gray-900 border border-green-500/30 rounded-lg p-4 text-green-400 font-mono text-sm break-all h-32 focus:outline-none"
                value={encryptedText}
                readOnly
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextEncryptionPage;
