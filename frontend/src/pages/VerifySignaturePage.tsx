import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Upload, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

interface VerifyResult {
  valid: boolean;
  fileName: string;
  message: string;
  timestamp: number;
}

const VerifySignaturePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [signatureInput, setSignatureInput] = useState('');
  const [publicKeyInput, setPublicKeyInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setError(''); setResult(null); }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) { setFile(selected); setError(''); setResult(null); }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleVerify = async () => {
    if (!file) { setError('Please select the file to verify.'); return; }
    // Signature is now optional for embedded verification
    if (!publicKeyInput.trim()) { setError('Please paste the public key.'); return; }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (signatureInput.trim()) {
        formData.append('signature', signatureInput.trim());
      }
      formData.append('publicKey', publicKeyInput.trim());

      const response = await api.post('/signature/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null); setSignatureInput(''); setPublicKeyInput('');
    setResult(null); setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="animate-slide-up p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors border border-blue-100">
            <ArrowLeft className="w-5 h-5 text-blue-900/40" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-5 bg-blue-100 rounded-3xl border border-blue-200 shadow-xl shadow-blue-500/5">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-blue-950 mb-1">Verify Signature</h1>
              <p className="text-blue-900/40 font-bold tracking-tight uppercase text-xs">Confirm a file's authenticity and integrity</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Result Banner */}
        {result && (
          <div className={`flex items-center gap-5 p-8 rounded-[2rem] border-2 mb-10 animate-scale-in shadow-xl shadow-blue-500/5 ${result.valid
            ? 'bg-blue-50 border-blue-200'
            : 'bg-red-50 border-red-200'}`}>
            <div className={`p-4 rounded-2xl ${result.valid ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>
              {result.valid
                ? <CheckCircle className="w-10 h-10 flex-shrink-0" />
                : <XCircle className="w-10 h-10 flex-shrink-0" />}
            </div>
            <div>
              <p className={`font-extrabold text-2xl tracking-tight mb-1 ${result.valid ? 'text-blue-950' : 'text-red-950'}`}>
                {result.valid ? 'Signature Verified' : 'Verification Failed'}
              </p>
              <p className={`text-sm font-medium ${result.valid ? 'text-blue-900/60' : 'text-red-900/60'}`}>{result.message}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* File Drop */}
          <div>
            <label className="text-xs font-bold text-blue-900/40 uppercase tracking-[0.2em] ml-1 block mb-3">File to Verify</label>
            {file ? (
              <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="p-3 bg-blue-100 rounded-xl border border-blue-200">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-blue-950 truncate">{file.name}</p>
                  <p className="text-xs font-bold text-blue-900/40 uppercase tracking-widest">{formatBytes(file.size)}</p>
                </div>
                <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">Change</button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[2.5rem] p-16 text-center cursor-pointer transition-all duration-500 glass
                  ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-2xl' : 'border-blue-100 hover:border-blue-500/30 bg-blue-50/20 hover:bg-blue-50/40'}`}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
                  <Upload className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-blue-400'}`} />
                </div>
                <p className="text-blue-900/60 font-bold mb-1">Drop the original asset here</p>
                <p className="text-[10px] font-bold text-blue-900/20 uppercase tracking-widest">or browse local filesystem</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              </div>
            )}
          </div>

          {/* Signature Input */}
          <div>
            <label className="text-xs font-bold text-blue-900/40 uppercase tracking-[0.2em] ml-1 block mb-3">
              Digital Signature Output
              <span className="ml-2 text-[10px] lowercase font-bold text-blue-900/20 tracking-normal">(optional if embedded)</span>
            </label>
            <textarea
              value={signatureInput}
              onChange={(e) => setSignatureInput(e.target.value)}
              placeholder="Paste the Base64-encoded signature here..."
              rows={4}
              className="w-full px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm font-mono text-blue-950 placeholder-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all resize-none font-bold shadow-inner"
            />
          </div>

          {/* Public Key Input */}
          <div>
            <label className="text-xs font-bold text-blue-900/40 uppercase tracking-[0.2em] ml-1 block mb-3">Public Key Protocol</label>
            <textarea
              value={publicKeyInput}
              onChange={(e) => setPublicKeyInput(e.target.value)}
              placeholder="Paste the RSA public key (Base64 encoded, X.509 format) here..."
              rows={4}
              className="w-full px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm font-mono text-blue-950 placeholder-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all resize-none font-bold shadow-inner"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleVerify}
              disabled={isLoading || !file || !publicKeyInput.trim()}
              className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-white text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-[0.98]"
            >
              {isLoading ? <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing...</> : <><ShieldCheck className="w-6 h-6" /> Run Verification</>}
            </button>
            {(result || file || signatureInput || publicKeyInput) && (
              <button onClick={reset} className="px-8 py-5 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl font-bold text-blue-900 transition-all active:scale-95 text-xs uppercase tracking-widest">
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifySignaturePage;
