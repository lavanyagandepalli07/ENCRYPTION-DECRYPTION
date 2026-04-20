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
    <div className="animate-slide-up p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors border border-blue-100">
            <ArrowLeft className="w-5 h-5 text-blue-900/40" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-5 bg-blue-100 rounded-3xl border border-blue-200 shadow-xl shadow-blue-500/5">
              <PenTool className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-blue-950 mb-1">Sign a File</h1>
              <p className="text-blue-900/40 font-bold tracking-tight uppercase text-xs">Apply a digital signature using RSA-SHA256</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-10">
          {(['upload', 'key', 'result'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all border
                ${step === s ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20 scale-110' : 
                  (step === 'key' && s === 'upload') || step === 'result' ? 'bg-blue-100 text-blue-600 border-blue-200' : 
                  'bg-blue-50 text-blue-900/20 border-blue-100'}`}>
                {i + 1}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${step === s ? 'text-blue-600' : 'text-blue-900/20'}`}>
                {s === 'upload' ? 'File' : s === 'key' ? 'Key' : 'Result'}
              </span>
              {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${step === 'result' || (step === 'key' && s === 'upload') ? 'bg-blue-200' : 'bg-blue-100'}`} />}
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
            className={`border-2 border-dashed rounded-[2.5rem] p-20 text-center cursor-pointer transition-all duration-500 glass
              ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-2xl' : 'border-blue-100 hover:border-blue-500/30 bg-blue-50/20 hover:bg-blue-50/40'}`}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all border border-blue-200">
              <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-blue-400'}`} />
            </div>
            <p className="text-xl font-bold text-blue-950 mb-2">Drop your asset here</p>
            <p className="text-blue-900/40 font-bold uppercase text-[10px] tracking-widest">or browse local filesystem</p>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {/* Step 2: Key Input */}
        {step === 'key' && file && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="p-3 bg-blue-100 rounded-xl border border-blue-200">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-blue-950 truncate">{file.name}</p>
                <p className="text-xs font-bold text-blue-900/40 uppercase tracking-widest">{formatBytes(file.size)}</p>
              </div>
              <button onClick={reset} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">Change</button>
            </div>

            {/* Key Generation */}
            <div className="glass rounded-[2.5rem] border border-blue-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl border border-blue-200">
                    <Key className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-blue-950">RSA Key Pair</h3>
                </div>
                <button
                  onClick={generateKeyPair}
                  disabled={isGeneratingKey}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  {isGeneratingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Generate Key Pair
                </button>
              </div>

              {generatedKeyPair && (
                <div className="space-y-4 mb-8">
                  <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-blue-900/40 font-bold uppercase tracking-widest font-mono">PUBLIC KEY (share this)</span>
                      <div className="flex gap-2">
                        <button onClick={() => copyToClipboard(generatedKeyPair.publicKey, 'pubkey')} className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-400">
                          {copiedField === 'pubkey' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => downloadText(generatedKeyPair.publicKey, 'public_key.txt')} className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-400">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 font-mono break-all line-clamp-2">{generatedKeyPair.publicKey}</p>
                  </div>
                  <div className="bg-red-50/30 rounded-2xl p-4 border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest font-mono">PRIVATE KEY (keep secret!)</span>
                      <div className="flex gap-2">
                        <button onClick={() => copyToClipboard(generatedKeyPair.privateKey, 'privkey')} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-400">
                          {copiedField === 'privkey' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => downloadText(generatedKeyPair.privateKey, 'private_key.txt')} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-400">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-red-600 font-mono break-all line-clamp-2">{generatedKeyPair.privateKey}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-blue-900/40 uppercase tracking-[0.2em] ml-1 block mb-2">Private Key Protocol Input</label>
                <textarea
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Paste your RSA private key (Base64 encoded, PKCS#8 format)..."
                  rows={5}
                  className="w-full px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm font-mono text-blue-950 placeholder-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all resize-none font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleSign}
              disabled={isLoading || !privateKey.trim()}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-white text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-[0.98]"
            >
              {isLoading ? <><Loader2 className="w-6 h-6 animate-spin" /> Processing Sequence...</> : <><PenTool className="w-6 h-6" /> Initiate Signing</>}
            </button>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && result && (
          <div className="space-y-6">
            <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] text-center shadow-xl shadow-blue-500/5">
              <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-blue-950 mb-2">Protocol Successful!</h2>
              <p className="text-xs font-bold text-blue-900/40 uppercase tracking-widest">{result.fileName} · {formatBytes(result.fileSize)} · {result.algorithm}</p>
            </div>

            <div className="glass rounded-[2.5rem] border border-blue-100 p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-widest">Digital Signature Output</span>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => copyToClipboard(result.signature, 'sig')} 
                    className="flex items-center gap-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-[10px] font-bold text-blue-600 transition-all border border-blue-100 uppercase tracking-widest active:scale-95"
                  >
                    {copiedField === 'sig' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedField === 'sig' ? 'Copied' : 'Copy'}
                  </button>
                  <button 
                    onClick={() => downloadText(result.signature, `${result.fileName}.sig`)} 
                    className="flex items-center gap-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-[10px] font-bold text-blue-600 transition-all border border-blue-100 uppercase tracking-widest active:scale-95"
                  >
                    <Download className="w-4 h-4" /> Sig
                  </button>
                  <button 
                    onClick={() => result.signedFile ? downloadBase64File(result.signedFile, `signed_${result.fileName}`) : downloadFile(file!)} 
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-[10px] font-bold text-white transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest active:scale-95"
                  >
                    <Download className="w-4 h-4" /> Final Asset
                  </button>
                </div>
              </div>
              <div className="bg-blue-50/50 rounded-[2rem] p-6 border border-blue-100 relative group shadow-inner">
                <p className="text-xs font-mono text-blue-600/90 break-all leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                  {result.signature}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-blue-50/50 to-transparent pointer-events-none rounded-b-[2rem]" />
              </div>
              <p className="mt-6 text-[10px] text-blue-900/40 flex items-center gap-2 font-bold uppercase tracking-widest">
                <AlertCircle className="w-3.5 h-3.5" />
                Cryptographic proof generated for "{result.fileName}".
              </p>
            </div>

            <button
              onClick={reset}
              className="w-full py-5 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl font-bold text-blue-900 transition-all duration-300 active:scale-95 uppercase tracking-widest text-xs"
            >
              Sign Another Asset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignFilePage;
