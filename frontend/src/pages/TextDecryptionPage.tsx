import React, { useState } from 'react';
import { textService } from '../services/api';
import { Unlock, Copy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TextDecryptionPage = () => {
  const [encryptedText, setEncryptedText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setDecryptedText('');
      const response = await textService.decryptText(encryptedText, passphrase);
      setDecryptedText(response.decryptedText);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to decrypt text.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(decryptedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <Link to="/" className="flex items-center text-purple-400 hover:text-purple-300 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          <div className="flex items-center mb-8 pb-6 border-b border-gray-700">
            <div className="p-3 bg-purple-500/20 rounded-lg mr-4">
              <Unlock className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Text Decryption
              </h1>
              <p className="text-gray-400 mt-1">Decrypt your secure AES-256-GCM messages.</p>
            </div>
          </div>

          <form onSubmit={handleDecrypt} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Encrypted Text (Base64)</label>
              <textarea
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-100 font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-32"
                placeholder="Paste the encrypted Base64 string here..."
                value={encryptedText}
                onChange={(e) => setEncryptedText(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Decryption Passphrase</label>
              <input
                type="password"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter the original passphrase"
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
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold shadow-lg transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Decrypting...' : 'Decrypt Text'}
            </button>
          </form>

          {decryptedText && (
            <div className="mt-8 pt-8 border-t border-gray-700 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-green-400">Decrypted Plain Text</label>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center text-sm text-gray-400 hover:text-white transition-colors bg-gray-900 px-3 py-1.5 rounded-md border border-gray-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </button>
              </div>
              <div className="w-full bg-gray-900 border border-green-500/30 rounded-lg p-4 text-gray-100 min-h-32 whitespace-pre-wrap">
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
