
import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PenTool, Upload, RefreshCw, Check, Download, AlertCircle, Loader2, ChevronRight, FileCode, Copy } from 'lucide-react';
import api from '../services/api';
import confetti from 'canvas-confetti';

type Step = 'upload' | 'key' | 'result';

interface SignResult {
  signature: string;
  fileName: string;
  fileSize: number;
  algorithm: string;
  message: string;
  timestamp: number;
  signedFile?: string;
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
  const [algorithm, setAlgorithm] = useState('RSA-SHA256');
  const [generatedKeyPair, setGeneratedKeyPair] = useState<KeyPair | null>(null);
  const [result, setResult] = useState<SignResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const algorithms = ['RSA-SHA256', 'RSA-SHA512', 'ECDSA-P256'];

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

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00A3FF', '#0070FF', '#ffffff']
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
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <Link to="/" className="inline-flex items-center text-blue-500/40 hover:text-blue-500 mb-8 transition-all group font-bold text-sm tracking-widest uppercase">
          <div className="p-2 bg-blue-500/10 rounded-lg mr-3 group-hover:bg-blue-500/20 transition-colors border border-blue-500/10">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Return to Infrastructure
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block w-fit">
            Protocol: RSA_SIGN_V2
          </div>
          <h1 className="text-4xl font-black tech-font tracking-tighter">FILE_SIGNING</h1>
          <p className="text-description text-sm font-medium mt-2">Generate immutable cryptographic proofs for digital assets.</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted">
          <span className={step === 'upload' ? 'text-blue-500' : ''}>01_SOURCE</span>
          <ChevronRight className="w-3 h-3" />
          <span className={step === 'key' ? 'text-blue-500' : ''}>02_AUTHORITY</span>
          <ChevronRight className="w-3 h-3" />
          <span className={step === 'result' ? 'text-blue-500' : ''}>03_OUTPUT</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-600/10 border border-red-500/30 text-red-500 text-xs font-bold tech-font flex items-center gap-3">
          <AlertCircle className="w-4 h-4" />
          {error.toUpperCase()}
        </div>
      )}

      {/* Step 1: Large Upload Zone */}
      {step === 'upload' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="upload-zone group aspect-[16/7] flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden bg-card border-sharp"
          >
            <div className="absolute inset-0 bg-grid opacity-10"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-6 bg-blue-600/10 border border-blue-500/20 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <Upload className={`w-10 h-10 ${isDragging ? 'animate-bounce' : ''}`} />
              </div>
              <h2 className="text-2xl font-bold tech-font mb-2 uppercase">INITIALIZE_FILE_LOAD</h2>
              <p className="text-muted text-xs font-bold uppercase tracking-[0.2em]">Drag system asset or click to browse</p>
            </div>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="border-sharp bg-card p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold tech-font uppercase">Pre_Flight_Auth_Gen</h3>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Generate cryptographic keys before loading assets</p>
              </div>
              <button
                onClick={generateKeyPair}
                disabled={isGeneratingKey}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-500 text-[10px] font-bold uppercase tracking-widest transition-all border border-blue-500/20 disabled:opacity-50"
              >
                {isGeneratingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                GENERATE_RSA_KEYPAIR
              </button>
            </div>

            {generatedKeyPair && (
              <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Public Key Box */}
                  <div className="bg-[var(--bg-main)]/50 border border-blue-500/20 p-6 relative group overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Check className="w-12 h-12 text-blue-500" />
                    </div>
                    <div className="flex justify-between items-center mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em]">Public_Identity_Key</h4>
                        </div>
                        <p className="text-[9px] text-muted font-bold uppercase mt-1 tracking-widest">Share freely for verification</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(generatedKeyPair.publicKey, 'pub')}
                        className="p-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white transition-all border border-blue-500/20 active:scale-95"
                        title="Copy Public Key"
                      >
                        {copiedField === 'pub' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="bg-black/60 p-4 border border-white/5 h-40 overflow-y-auto custom-scrollbar shadow-inner">
                      <code className="text-[10px] font-mono text-blue-400/70 break-all leading-relaxed selection:bg-blue-500/30">
                        {generatedKeyPair.publicKey}
                      </code>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[8px] text-muted font-medium italic">Standard RSA format for signature verification</p>
                      <button onClick={() => downloadText(generatedKeyPair.publicKey, 'public_key.txt')} className="text-[9px] font-bold text-muted hover:text-blue-500 flex items-center gap-1.5 uppercase transition-colors">
                        <Download className="w-3.3 h-3.3" /> Download
                      </button>
                    </div>
                  </div>

                  {/* Private Key Box */}
                  <div className="bg-[var(--bg-main)]/50 border border-red-500/20 p-6 relative group overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <div className="flex justify-between items-center mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.2em]">Private_Authority_Key</h4>
                        </div>
                        <p className="text-[9px] text-muted font-bold uppercase mt-1 tracking-widest">KEEP SECRET - NEVER SHARE</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(generatedKeyPair.privateKey, 'priv')}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all border border-red-500/20 active:scale-95"
                        title="Copy Private Key"
                      >
                        {copiedField === 'priv' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="bg-black/60 p-4 border border-white/5 h-40 overflow-y-auto custom-scrollbar shadow-inner">
                      <code className="text-[10px] font-mono text-red-400/70 break-all leading-relaxed selection:bg-red-500/30">
                        {generatedKeyPair.privateKey}
                      </code>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[8px] text-red-500/60 font-medium italic uppercase tracking-tighter">Required for signing protocol</p>
                      <button onClick={() => downloadText(generatedKeyPair.privateKey, 'private_key.txt')} className="text-[9px] font-bold text-muted hover:text-red-500 flex items-center gap-1.5 uppercase transition-colors">
                        <Download className="w-3.3 h-3.3" /> Download
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-6 bg-blue-600/5 border border-blue-500/10 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
                  <div className="md:col-span-1 border-r border-blue-500/10 pr-6">
                    <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Protocol_Intelligence</h5>
                    <p className="text-[9px] text-muted font-medium leading-relaxed">Asymmetric cryptography uses a key pair to ensure authenticity without sharing secret keys.</p>
                  </div>
                  <div className="md:col-span-1 border-r border-blue-500/10 pr-6">
                    <h5 className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">What is the Public Key?</h5>
                    <p className="text-[9px] text-muted/80 font-medium leading-relaxed">The <span className="text-blue-400">Public Key</span> is like your digital fingerprint. Give it to anyone; they use it to verify that the file was truly signed by you.</p>
                  </div>
                  <div className="md:col-span-1">
                    <h5 className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">What is the Private Key?</h5>
                    <p className="text-[9px] text-muted/80 font-medium leading-relaxed">The <span className="text-red-400">Private Key</span> is your master authority. It must be guarded. If compromised, others can forge your identity.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Key & Configuration */}
      {step === 'key' && file && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-1 space-y-6">
            <div className="border-sharp bg-card p-6">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Target_Resource</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-500">
                  <FileCode className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold tech-font truncate text-sm">{file.name.toUpperCase()}</p>
                  <p className="text-[10px] text-muted font-bold">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button onClick={reset} className="w-full py-3 border-sharp bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest transition-all">
                Reset_Load
              </button>
            </div>

            <div className="border-sharp bg-card p-6">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Signing_Protocol</p>
              <div className="flex flex-wrap gap-2">
                {algorithms.map((alg) => (
                  <button
                    key={alg}
                    onClick={() => setAlgorithm(alg)}
                    className={`px-3 py-2 text-[10px] font-bold transition-all border ${
                      algorithm === alg 
                        ? 'chip-active' 
                        : 'border-sharp bg-card text-muted hover:border-blue-500/30'
                    }`}
                  >
                    {alg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="border-sharp bg-card p-8 relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold tech-font uppercase">PRIVATE_KEY_AUTHORITY</h3>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Authentication required for signature</p>
                </div>
                <button
                  onClick={generateKeyPair}
                  disabled={isGeneratingKey}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isGeneratingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  GEN_KEYPAIR
                </button>
              </div>

              {generatedKeyPair && (
                <div className="space-y-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[var(--bg-main)]/50 border border-blue-500/10 p-4 relative group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Public_Key</span>
                        <button 
                          onClick={() => copyToClipboard(generatedKeyPair.publicKey, 'pub-s2')}
                          className="text-[9px] font-bold text-blue-500 hover:text-white transition-colors uppercase"
                        >
                          {copiedField === 'pub-s2' ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                      <div className="text-[9px] font-mono text-blue-400/60 break-all line-clamp-2 overflow-hidden bg-black/30 p-2 border border-white/5">
                        {generatedKeyPair.publicKey}
                      </div>
                    </div>
                    <div className="bg-[var(--bg-main)]/50 border border-red-500/10 p-4 relative group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Private_Key</span>
                        <button 
                          onClick={() => copyToClipboard(generatedKeyPair.privateKey, 'priv-s2')}
                          className="text-[9px] font-bold text-red-500 hover:text-white transition-colors uppercase"
                        >
                          {copiedField === 'priv-s2' ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                      <div className="text-[9px] font-mono text-red-400/60 break-all line-clamp-2 overflow-hidden bg-black/30 p-2 border border-white/5">
                        {generatedKeyPair.privateKey}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-600/5 border border-blue-500/10 text-[9px] text-muted font-bold uppercase tracking-widest flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                    KEY_PAIR_LOADED: YOUR PRIVATE KEY HAS BEEN AUTOMATICALLY INSERTED INTO THE AUTHORIZATION FIELD BELOW.
                  </div>
                </div>
              )}

              <textarea
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="INPUT_PRIVATE_KEY_PKCS8..."
                className="w-full h-48 px-6 py-5 bg-[var(--bg-main)] border border-sharp text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all resize-none font-bold placeholder:text-placeholder"
              />

              <button
                onClick={handleSign}
                disabled={isLoading || !privateKey.trim()}
                className="w-full mt-8 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-[0.3em] transition-all glow-blue hover:glow-blue-strong disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" /> EXECUTING_PROTOCOL...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <PenTool className="w-5 h-5" /> AUTHORIZE_SIGNATURE
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 'result' && result && (
        <div className="animate-in zoom-in-95 duration-500">
          <div className="border-sharp bg-card p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-8">
                <Check className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-3xl font-black tech-font mb-2">SIGNATURE_VERIFIED</h2>
              <p className="text-muted text-[10px] font-bold uppercase tracking-[0.4em] mb-12">Cryptographic proof generated successfully</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <button 
                  onClick={() => downloadText(result.signature, `${result.fileName}.sig`)} 
                  className="py-4 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                >
                  <Download className="w-4 h-4" /> Save_Signature
                </button>
                <button 
                  onClick={() => result.signedFile ? downloadBase64File(result.signedFile, `signed_${result.fileName}`) : null} 
                  className="py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 glow-blue"
                >
                  <Download className="w-4 h-4" /> Download_Signed_Asset
                </button>
              </div>

              <div className="mt-12 text-left border-sharp bg-[var(--bg-main)]/40 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-muted uppercase tracking-widest">Raw_Signature_Hex</span>
                  <button onClick={() => copyToClipboard(result.signature, 'sig')} className="text-[9px] font-bold text-blue-500 hover:text-blue-400 uppercase">
                    {copiedField === 'sig' ? 'COPIED' : 'COPY_RAW'}
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto custom-scrollbar text-[10px] font-mono text-blue-500/50 break-all leading-relaxed">
                  {result.signature}
                </div>
              </div>

              <button
                onClick={reset}
                className="mt-12 text-[10px] font-black text-muted hover:text-[var(--text-main)] uppercase tracking-[0.3em] transition-colors"
              >
                [ Initialize_New_Sequence ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignFilePage;
