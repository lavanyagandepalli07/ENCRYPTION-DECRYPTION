import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PenTool, Upload, Key, RefreshCw, Copy, Check, Download, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

type Step = 'upload' | 'key' | 'result';

interface SignResult {
  signature: string;
  fileName: string;
  fileSize: number;
  algorithm: string;
  message: string;
  timestamp: number;
  signedFile?: string; // Base64 encoded embedded signed file
}

interface KeyPair {
  privateKey: string;
  publicKey: string;
  algorithm: string;
}

const SignFilePage = () => {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [generatedKeyPair, setGeneratedKeyPair] = useState<KeyPair | null>(null);
  const [result, setResult] = useState<SignResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setStep('key'); setError(''); }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) { setFile(selected); setStep('key'); setError(''); }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadBase64File = (base64: string, filename: string) => {
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    const blob = new Blob([array], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadFile = (f: File) => {
    const url = URL.createObjectURL(f);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateKeyPair = async () => {
    setIsGeneratingKey(true);
    setError('');
    try {
      const response = await api.get('/signature/generate-keypair');
      setGeneratedKeyPair(response.data);
      setPrivateKey(response.data.privateKey);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Key generation failed');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleSign = async () => {
    if (!file || !privateKey.trim()) {
      setError('Please provide both a file and a private key.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('privateKey', privateKey.trim());
      const response = await api.post('/signature/sign', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
      setStep('result');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signing failed. Check your private key.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const reset = () => {
    setStep('upload'); setFile(null); setPrivateKey('');
    setGeneratedKeyPair(null); setResult(null); setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-blue-500/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <PenTool className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Sign a File</h1>
              <p className="text-sm text-gray-400">Apply a digital signature using RSA-SHA256</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {(['upload', 'key', 'result'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${step === s ? 'bg-blue-600 text-white' : 
                  (step === 'key' && s === 'upload') || step === 'result' ? 'bg-blue-600/30 text-blue-400' : 
                  'bg-zinc-800 text-gray-500'}`}>
                {i + 1}
              </div>
              <span className={`text-sm capitalize ${step === s ? 'text-blue-400' : 'text-gray-500'}`}>
                {s === 'upload' ? 'Select File' : s === 'key' ? 'Private Key' : 'Signature'}
              </span>
              {i < 2 && <div className={`flex-1 h-px ${step === 'result' || (step === 'key' && s === 'upload') ? 'bg-blue-600/30' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Step 1: File Upload */}
        {step === 'upload' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300
              ${isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/50 bg-zinc-950/50 hover:bg-zinc-950'}`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-400' : 'text-gray-500'}`} />
            <p className="text-xl font-semibold text-gray-300 mb-2">Drop your file here</p>
            <p className="text-gray-500 text-sm">or click to browse</p>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {/* Step 2: Key Input */}
        {step === 'key' && file && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-xl border border-white/10">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Upload className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-200 truncate">{file.name}</p>
                <p className="text-sm text-gray-400">{formatBytes(file.size)}</p>
              </div>
              <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Change</button>
            </div>

            {/* Key Generation */}
            <div className="bg-zinc-950 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">RSA Key Pair</h3>
                </div>
                <button
                  onClick={generateKeyPair}
                  disabled={isGeneratingKey}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isGeneratingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Generate New Key Pair
                </button>
              </div>

              {generatedKeyPair && (
                <div className="space-y-4 mb-4">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 font-mono">PUBLIC KEY (share this)</span>
                      <div className="flex gap-2">
                        <button onClick={() => copyToClipboard(generatedKeyPair.publicKey, 'pubkey')} className="text-gray-500 hover:text-gray-300 transition-colors">
                          {copiedField === 'pubkey' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => downloadText(generatedKeyPair.publicKey, 'public_key.txt')} className="text-gray-500 hover:text-gray-300 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-blue-400 font-mono break-all line-clamp-3">{generatedKeyPair.publicKey}</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3 border border-red-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-red-400 font-mono">PRIVATE KEY (keep secret!)</span>
                      <div className="flex gap-2">
                        <button onClick={() => copyToClipboard(generatedKeyPair.privateKey, 'privkey')} className="text-gray-500 hover:text-gray-300 transition-colors">
                          {copiedField === 'privkey' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => downloadText(generatedKeyPair.privateKey, 'private_key.txt')} className="text-gray-500 hover:text-gray-300 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-red-400/80 font-mono break-all line-clamp-3">{generatedKeyPair.privateKey}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Paste Your Private Key (Base64)</label>
                <textarea
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Paste your RSA private key (Base64 encoded, PKCS#8 format)..."
                  rows={5}
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSign}
              disabled={isLoading || !privateKey.trim()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing...</> : <><PenTool className="w-5 h-5" /> Sign File</>}
            </button>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && result && (
          <div className="space-y-6">
            <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
              <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-green-400 mb-1">File Signed Successfully!</h2>
              <p className="text-sm text-gray-400">{result.fileName} · {formatBytes(result.fileSize)} · {result.algorithm}</p>
            </div>

            <div className="bg-zinc-950 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-white">Digital Signature (Base64)</span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => copyToClipboard(result.signature, 'sig')} 
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-sm text-gray-300 transition-all border border-white/10 hover:border-blue-500/30"
                  >
                    {copiedField === 'sig' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copiedField === 'sig' ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    onClick={() => downloadText(result.signature, `${result.fileName}.sig`)} 
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-sm text-gray-300 transition-all border border-white/10 hover:border-blue-500/30"
                  >
                    <Download className="w-4 h-4" /> Detached Sig
                  </button>
                  <button 
                    onClick={() => result.signedFile ? downloadBase64File(result.signedFile, `signed_${result.fileName}`) : downloadFile(file!)} 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Download className="w-4 h-4" /> Download Signed File
                  </button>
                </div>
              </div>
              <div className="bg-black rounded-xl p-5 border border-white/10 relative group">
                <p className="text-xs font-mono text-blue-400/90 break-all leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                  {result.signature}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black to-transparent pointer-events-none rounded-b-xl" />
              </div>
              <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                This .sig file contains the cryptographic proof for "{result.fileName}".
              </p>
            </div>

            <button
              onClick={reset}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 border border-white/10 hover:border-blue-500/50 rounded-xl font-medium text-white transition-all duration-200"
            >
              Sign Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignFilePage;
