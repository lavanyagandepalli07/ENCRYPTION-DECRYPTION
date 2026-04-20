
import { Link } from 'react-router-dom';
import { Lock, Unlock, FileUp, FileDown, PenTool, ShieldCheck, Activity, ClipboardList, ShieldAlert, ArrowRight } from 'lucide-react';

const DashboardPage = () => {
  const tools = [
    { to: "/file-encrypt", icon: FileUp, title: "Encrypt File", desc: "Military-grade protection for your sensitive documents.", color: "blue" },
    { to: "/file-decrypt", icon: FileDown, title: "Decrypt File", desc: "Securely recover original contents from encrypted files.", color: "blue" },
    { to: "/text-encrypt", icon: Lock, title: "Encrypt Text", desc: "Transform messages into unbreakable ciphertext instantly.", color: "blue" },
    { to: "/text-decrypt", icon: Unlock, title: "Decrypt Text", desc: "Restore plain text from secure cryptographic strings.", color: "blue" },
    { to: "/sign-file", icon: PenTool, title: "Digital Signature", desc: "Apply cryptographic signatures to verify file origin.", color: "indigo" },
    { to: "/verify-signature", icon: ShieldCheck, title: "Verify Authenticity", desc: "Ensure files remain genuine and completely unaltered.", color: "indigo" },
    { to: "/check-integrity", icon: Activity, title: "Integrity Scan", desc: "Verify cryptographic hashes for data consistency.", color: "slate" },
    { to: "/audit-log", icon: ClipboardList, title: "Security Logs", desc: "Review detailed immutable records of all operations.", color: "slate" },
  ];

  return (
    <div className="animate-slide-up space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/10 blur-[80px] rounded-full -z-10 animate-pulse-slow"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 border border-blue-200 text-blue-600 text-xs font-bold tracking-widest uppercase mb-6">
          <ShieldAlert className="w-3 h-3" />
          Quantum-Ready Protection
        </div>
        <h1 className="text-6xl font-extrabold tracking-tighter mb-6 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-600 bg-clip-text text-transparent">
          Secure your digital <br /> <span className="text-blue-500">sovereignty.</span>
        </h1>
        <p className="text-lg text-blue-900/60 max-w-2xl mx-auto leading-relaxed font-medium">
          The most advanced cryptographic suite for personal and enterprise security. 
          Encrypt, sign, and verify with absolute confidence.
        </p>
      </section>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tools.map((tool, idx) => (
          <Link
            key={idx}
            to={tool.to}
            className="group relative glass rounded-3xl p-8 transition-all duration-500 hover:bg-white hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)] border-blue-100 hover:border-blue-500/30 flex flex-col h-full overflow-hidden"
          >
            {/* Hover Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/0 via-blue-100/0 to-blue-100/0 group-hover:to-blue-100/30 transition-colors duration-500"></div>
            
            <div className="relative z-10">
              <div className="p-3 bg-blue-100/50 rounded-2xl w-fit mb-6 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all duration-500 border border-blue-200 group-hover:border-blue-500/30">
                <tool.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-3 text-blue-950 group-hover:text-blue-600 transition-colors">{tool.title}</h2>
              <p className="text-sm text-blue-900/60 leading-relaxed mb-6 font-medium">
                {tool.desc}
              </p>
              <div className="mt-auto flex items-center gap-2 text-xs font-bold text-blue-900/40 group-hover:text-blue-600 transition-colors uppercase tracking-widest">
                Access Tool <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Status / Call to Action */}
      <section className="glass rounded-[2rem] p-12 border-blue-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold text-blue-950 mb-2">Need Enterprise-Grade Support?</h3>
            <p className="text-blue-900/60 font-medium">Our team can help you integrate SecureVault into your existing infrastructure.</p>
          </div>
          <Link 
            to="/support"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all duration-300 shadow-xl shadow-blue-500/20 active:scale-95 text-center"
          >
            Contact Security Specialists
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
