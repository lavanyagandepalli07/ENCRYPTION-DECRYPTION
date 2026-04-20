import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Upload, AlertCircle, Loader2, Copy, Check, RefreshCw } from 'lucide-react';
import api from '../services/api';

interface HashResult {
  fileName: string;
  fileSize: number;
  hashes: Record<string, string>;
  message: string;
  timestamp: number;
}

const ALGO_COLORS: Record<string, string> = {
  'MD5': 'text-red-600',
  'SHA-1': 'text-amber-600',
  'SHA-256': 'text-blue-600',
  'SHA-512': 'text-indigo-600',
};

const ALGO_WARNINGS: Record<string, string | null> = {
  'MD5': 'Cryptographically broken — use only for non-security checksums.',
  'SHA-1': 'Deprecated for security use — prefer SHA-256 or higher.',
  'SHA-256': null,
  'SHA-512': null,
};

const CheckIntegrityPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compareHash, setCompareHash] = useState('');
  const [compareAlgo, setCompareAlgo] = useState('SHA-256');
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<HashResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
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

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleCompute = async () => {
    if (!file) { setError('Please select a file first.'); return; }
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/integrity/hash', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Hash computation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchStatus = () => {
    if (!result || !compareHash.trim()) return null;
    const hash = result.hashes[compareAlgo];
    if (!hash) return null;
    return hash.toLowerCase() === compareHash.trim().toLowerCase() ? 'match' : 'mismatch';
  };
  const matchStatus = getMatchStatus();

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
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-blue-950 mb-1">Check File Integrity</h1>
              <p className="text-blue-900/40 font-bold tracking-tight uppercase text-xs">Compute and compare cryptographic hashes</p>
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

        <div className="space-y-6">
          {/* File Drop */}
          <div>
            <label className="text-xs font-bold text-blue-900/40 uppercase tracking-[0.2em] ml-1 block mb-3">Select Asset</label>
            {file ? (
              <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="p-3 bg-blue-100 rounded-xl border border-blue-200">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-blue-950 truncate">{file.name}</p>
                  <p className="text-xs font-bold text-blue-900/40 uppercase tracking-widest">{formatBytes(file.size)}</p>
                </div>
                <button
                  onClick={() => { setFile(null); setResult(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
                >
                  Change
                </button>
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
                  <Activity className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-blue-400'}`} />
                </div>
                <p className="text-blue-900/60 font-bold mb-1">Drop your asset here</p>
                <p className="text-[10px] font-bold text-blue-900/20 uppercase tracking-widest">or browse local filesystem</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              </div>
            )}
          </div>

          {/* Compute Button */}
          <button
            onClick={handleCompute}
            disabled={isLoading || !file}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-white text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-[0.98]"
          >
            {isLoading ? <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing Sequence...</> : <><Activity className="w-6 h-6" /> Compute Integrity Hashes</>}
          </button>

          {/* Results */}
          {result && (
            <div className="glass rounded-[2.5rem] border border-blue-100 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-blue-100 flex items-center justify-between bg-blue-50/50">
                <div>
                  <p className="font-bold text-blue-950">{result.fileName}</p>
                  <p className="text-xs font-bold text-blue-900/40 uppercase tracking-widest">{formatBytes(result.fileSize)}</p>
                </div>
                <button onClick={handleCompute} className="p-2.5 bg-blue-100 rounded-xl text-blue-600 hover:bg-blue-200 transition-all active:scale-95 border border-blue-200" title="Recompute">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-blue-100 bg-white">
                {Object.entries(result.hashes).map(([algo, hash]) => (
                  <div key={algo} className="p-6 hover:bg-blue-50/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold font-mono px-3 py-1 rounded-full ${ALGO_COLORS[algo]} bg-blue-50 border border-blue-100 tracking-widest uppercase`}>{algo}</span>
                        {ALGO_WARNINGS[algo] && (
                          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{ALGO_WARNINGS[algo]}</span>
                        )}
                      </div>
                      <button onClick={() => copyToClipboard(hash, algo)} className="flex items-center gap-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-all uppercase tracking-widest">
                        {copiedField === algo ? <><Check className="w-4 h-4 text-green-500" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Hash</>}
                      </button>
                    </div>
                    <p className={`text-xs font-mono break-all font-bold ${ALGO_COLORS[algo]}`}>{hash}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hash Comparison */}
          {result && (
            <div className="glass rounded-[2.5rem] border border-blue-100 p-8 shadow-xl">
              <h3 className="text-xs font-bold text-blue-950 uppercase tracking-widest mb-6">Compare Against Known Hash Protocol</h3>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select
                  value={compareAlgo}
                  onChange={(e) => setCompareAlgo(e.target.value)}
                  className="px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all uppercase tracking-widest"
                >
                  {Object.keys(result.hashes).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <input
                  type="text"
                  value={compareHash}
                  onChange={(e) => setCompareHash(e.target.value)}
                  placeholder="Paste hash to compare..."
                  className="flex-1 px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm font-mono text-blue-950 placeholder-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all font-bold"
                />
              </div>
              {matchStatus && (
                <div className={`flex items-center gap-4 p-5 rounded-2xl animate-scale-in border-2 ${matchStatus === 'match' ? 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/5' : 'bg-red-50 border-red-200 shadow-lg shadow-red-500/5'}`}>
                  <div className={`p-2 rounded-xl ${matchStatus === 'match' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                    {matchStatus === 'match' ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <span className={`text-sm font-bold uppercase tracking-wide ${matchStatus === 'match' ? 'text-blue-950' : 'text-red-950'}`}>
                    {matchStatus === 'match' 
                      ? 'Integrity Verified — Hashes match sequence exactly.' 
                      : 'Integrity Violation — Hashes do not match. Asset potentially tampered.'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckIntegrityPage;
