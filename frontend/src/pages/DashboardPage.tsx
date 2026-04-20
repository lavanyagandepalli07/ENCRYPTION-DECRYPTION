
import { Link } from 'react-router-dom';
import { Lock, Unlock, FileUp, FileDown, PenTool, ShieldCheck, Activity, ClipboardList, ShieldAlert } from 'lucide-react';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center mb-16">
        <ShieldAlert className="w-16 h-16 text-blue-500 mx-auto mb-6" />
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-blue-600 to-white bg-clip-text text-transparent mb-4 tracking-tight">
          SecureVault
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Military-grade encryption for your most sensitive data. 
          Choose an operation below to get started securely.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        <Link
          to="/file-encrypt"
          className="group relative bg-zinc-950 rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
            <FileUp className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Encrypt File</h2>
          <p className="text-sm text-gray-400 flex-grow">
            Securely upload and encrypt files using military-grade encryption.
          </p>
        </Link>

        <Link
          to="/file-decrypt"
          className="group relative bg-zinc-950 rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
            <FileDown className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Decrypt File</h2>
          <p className="text-sm text-gray-400 flex-grow">
            Upload an encrypted file to recover its original contents securely.
          </p>
        </Link>

        <Link
          to="/text-encrypt"
          className="group relative bg-zinc-950 rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Encrypt Text</h2>
          <p className="text-sm text-gray-400 flex-grow">
            Secure sensitive messages, passwords, or configurations into unbreakable ciphertext.
          </p>
        </Link>

        <Link
          to="/text-decrypt"
          className="group relative bg-zinc-950 rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
            <Unlock className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Decrypt Text</h2>
          <p className="text-sm text-gray-400 flex-grow">
            Recover original plain text from an encrypted string using a passphrase.
          </p>
        </Link>

        <Link
          to="/sign-file"
          className="group relative bg-zinc-950 rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
            <PenTool className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Sign a File</h2>
          <p className="text-sm text-gray-400 flex-grow">
            Apply a digital signature to your file to prove its authenticity and origin.
          </p>
        </Link>

        <Link
          to="/verify-signature"
          className="group relative bg-zinc-950 rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Verify Signature</h2>
          <p className="text-sm text-gray-400 flex-grow">
            Verify a digital signature to ensure a file is genuine and unaltered.
          </p>
        </Link>

        <Link
          to="/check-integrity"
          className="group relative bg-zinc-950 rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Check Integrity</h2>
          <p className="text-sm text-gray-400 flex-grow">
            Calculate and compare cryptographic hashes to verify file integrity.
          </p>
        </Link>

        <Link
          to="/audit-log"
          className="group relative bg-zinc-950 rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
            <ClipboardList className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">View Audit Log</h2>
          <p className="text-sm text-gray-400 flex-grow">
            Review detailed logs of all security operations performed on the system.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
