
import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileUp, Lock, ArrowLeft, Loader2, ShieldCheck,
  AlertCircle, Eye, EyeOff, X, FileText, Upload, Download, ArrowRight
} from 'lucide-react';
import api from '../services/api';
import PassphraseStrength from '../components/PassphraseStrength';
import ConfirmModal from '../components/ConfirmModal';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB
const WARN_FILE_SIZE_BYTES = 100 * 1024 * 1024;      // 100 MB warn threshold

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileEncryptionPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showConfirmPassphrase, setShowConfirmPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    if (f.size > MAX_FILE_SIZE_BYTES) {
      return `File too large. Maximum size is 5 GB. Your file is ${formatBytes(f.size)}.`;
    }
    return null;
  };

  const handleFileSelect = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) { setError('Please select a file to encrypt.'); return; }
    if (passphrase.length < 8) { setError('Passphrase must be at least 8 characters long.'); return; }
    if (passphrase !== confirmPassphrase) { setError('Passphrases do not match.'); return; }

    setShowConfirm(true);
  };

  const handleEncrypt = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file!);
      formData.append('passphrase', passphrase);

      const response = await api.post('/encrypt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(pct);
          }
        },
      });

      setSuccess(response.data);
      
      const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/download-encrypted/${response.data.fileId}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `encrypted_${response.data.fileName || 'file'}.bin`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setFile(null);
      setPassphrase('');
      setConfirmPassphrase('');
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to encrypt file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isLargeFile = file && file.size > WARN_FILE_SIZE_BYTES;

  return (
    <div className="animate-slide-up max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center text-blue-900/40 hover:text-blue-600 mb-10 transition-all group font-bold text-sm tracking-widest uppercase">
        <div className="p-2 bg-blue-50 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors border border-blue-100">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Return to Infrastructure
      </Link>

      <div className="glass rounded-[2.5rem] p-8 sm:p-12 border-blue-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-12 relative z-10">
          <div className="p-5 bg-blue-100 rounded-3xl border border-blue-200 shadow-xl shadow-blue-500/5">
            <FileUp className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-950 mb-1">File Encryption</h1>
            <p className="text-blue-900/40 font-bold tracking-tight uppercase text-xs">Advanced AES-256-GCM Secure Protocol</p>
          </div>
        </div>

        {error && (
          <div className="mb-10 p-5 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-start text-red-400 animate-slide-up">
            <AlertCircle className="w-5 h-5 mr-4 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-10 p-8 glass rounded-[2.5rem] border-blue-500/30 flex flex-col items-center text-center animate-scale-in">
            <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center border border-blue-500/30 mb-8 shadow-xl shadow-blue-500/10">
              <ShieldCheck className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-blue-950 mb-4 tracking-tight">Encryption Sequence Complete</h3>
            <p className="text-blue-900/60 mb-8 max-w-sm font-medium">Your data has been transformed into a secure cryptographic format.</p>
            
            <div className="bg-blue-50 p-6 rounded-2xl w-full text-left font-mono text-sm border border-blue-100 space-y-2 mb-8">
              <p className="flex justify-between"><span className="text-blue-900/40 font-bold uppercase tracking-widest text-[10px]">Vault ID:</span> <span className="text-blue-600 font-bold">{success.fileId}</span></p>
              <p className="flex justify-between"><span className="text-blue-900/40 font-bold uppercase tracking-widest text-[10px]">Resource:</span> <span className="text-blue-900/80 truncate ml-4">{success.fileName}</span></p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <a
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/download-encrypted/${success.fileId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 group active:scale-95"
              >
                <Download className="w-5 h-5" />
                Download Asset
              </a>
              <button
                onClick={() => setSuccess(null)}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 border border-blue-100 active:scale-95"
              >
                Initialize New Operation
              </button>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Drag & Drop Zone */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-blue-900/40 uppercase tracking-[0.2em] ml-1">Secure Asset Selection</label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative border-2 border-dashed rounded-[2rem] p-10 cursor-pointer transition-all duration-500 text-center ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-2xl shadow-blue-500/10'
                    : file
                    ? 'border-blue-500/40 bg-blue-50/50'
                    : 'border-blue-100 hover:border-blue-500/30 bg-blue-50/20 hover:bg-blue-50/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="p-4 bg-blue-100 rounded-2xl mr-4 flex-shrink-0 border border-blue-200">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-lg font-bold text-blue-950 truncate">{file.name}</p>
                        <p className="text-sm text-blue-900/40 font-bold uppercase tracking-widest">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all ml-4"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="py-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-blue-200 transition-all duration-500 border border-blue-200">
                      <Upload className="w-8 h-8 text-blue-400 group-hover:text-blue-600" />
                    </div>
                    <p className="text-lg text-blue-900 font-bold mb-1">
                      Drop your asset here
                    </p>
                    <p className="text-sm text-blue-900/40 font-bold">
                      or <span className="text-blue-600 hover:underline">browse local filesystem</span>
                    </p>
                    <p className="text-[10px] text-blue-900/20 font-bold uppercase tracking-[0.2em] mt-6">Any format &bull; 5 GB Maximum</p>
                  </div>
                )}
              </div>

              {isLargeFile && (
                <div className="mt-4 flex items-center gap-3 text-amber-400 text-xs font-bold bg-amber-400/5 p-3 rounded-xl border border-amber-400/20 animate-pulse">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>LARGE ASSET DETECTED ({formatBytes(file!.size)}). PROCESSING TIME MAY VARY.</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Passphrase */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-900/40 uppercase tracking-[0.2em] ml-1">Encryption Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-blue-300 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl pl-12 pr-12 py-4 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all font-bold placeholder-blue-900/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-blue-300 hover:text-blue-500 transition-colors"
                  >
                    {showPassphrase ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <PassphraseStrength passphrase={passphrase} />
              </div>

              {/* Confirm Passphrase */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-900/40 uppercase tracking-[0.2em] ml-1">Verify Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors">
                    {confirmPassphrase && passphrase === confirmPassphrase
                      ? <ShieldCheck className="w-5 h-5 text-blue-500" />
                      : <Lock className="w-5 h-5 text-blue-300 group-focus-within:text-blue-500" />
                    }
                  </div>
                  <input
                    type={showConfirmPassphrase ? 'text' : 'password'}
                    value={confirmPassphrase}
                    onChange={(e) => setConfirmPassphrase(e.target.value)}
                    placeholder="Re-type key"
                    className={`w-full bg-blue-50/50 border rounded-2xl pl-12 pr-12 py-4 text-blue-950 focus:outline-none focus:ring-2 transition-all font-bold placeholder-blue-900/20 ${
                      confirmPassphrase && passphrase !== confirmPassphrase
                        ? 'border-red-500/30 focus:ring-red-500/20'
                        : confirmPassphrase && passphrase === confirmPassphrase
                        ? 'border-blue-500/30 focus:ring-blue-500/20'
                        : 'border-blue-100 focus:ring-blue-500/40'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassphrase(!showConfirmPassphrase)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-blue-300 hover:text-blue-500 transition-colors"
                  >
                    {showConfirmPassphrase ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isLoading && progress > 0 && (
              <div className="animate-fade-in pt-4">
                <div className="flex justify-between text-[10px] font-bold text-blue-900/40 uppercase tracking-widest mb-3">
                  <span>Cryptographic Processing...</span>
                  <span className="text-blue-600">{progress}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden border border-blue-200">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !file || !passphrase || passphrase !== confirmPassphrase}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-[2rem] transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-blue-600/20 hover:shadow-blue-600/40 group active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Processing Protocol...
                </>
              ) : (
                <span className="flex items-center gap-3 text-lg">
                  Initiate Encryption <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Protocol Confirmation"
        message={`Authorize the encryption of "${file?.name}"? Ensure your key is stored securely; encrypted data without a key is irrecoverable.`}
        confirmLabel="Authorize Sequence"
        onConfirm={handleEncrypt}
        onCancel={() => setShowConfirm(false)}
        variant="warning"
      />
    </div>
  );
};

export default FileEncryptionPage;
