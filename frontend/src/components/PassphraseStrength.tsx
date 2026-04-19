interface PassphraseStrengthProps {
  passphrase: string;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  barColor: string;
}

export const getPassphraseStrength = (passphrase: string): StrengthResult => {
  if (!passphrase) return { score: 0, label: '', color: 'text-gray-500', barColor: 'bg-gray-600' };

  let score = 0;
  if (passphrase.length >= 8) score++;
  if (passphrase.length >= 12) score++;
  if (passphrase.length >= 16) score++;
  if (/[A-Z]/.test(passphrase)) score++;
  if (/[a-z]/.test(passphrase)) score++;
  if (/[0-9]/.test(passphrase)) score++;
  if (/[^A-Za-z0-9]/.test(passphrase)) score++;

  if (score <= 2) return { score: 1, label: 'Weak', color: 'text-red-400', barColor: 'bg-red-500' };
  if (score <= 4) return { score: 2, label: 'Fair', color: 'text-yellow-400', barColor: 'bg-yellow-500' };
  if (score <= 5) return { score: 3, label: 'Strong', color: 'text-emerald-400', barColor: 'bg-emerald-500' };
  return { score: 4, label: 'Very Strong', color: 'text-cyan-400', barColor: 'bg-cyan-500' };
};

const PassphraseStrength = ({ passphrase }: PassphraseStrengthProps) => {
  if (!passphrase) return null;

  const { score, label, color, barColor } = getPassphraseStrength(passphrase);

  const tips: string[] = [];
  if (passphrase.length < 12) tips.push('Use 12+ characters');
  if (!/[A-Z]/.test(passphrase)) tips.push('Add uppercase letters');
  if (!/[0-9]/.test(passphrase)) tips.push('Add numbers');
  if (!/[^A-Za-z0-9]/.test(passphrase)) tips.push('Add special characters');

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Passphrase strength</span>
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
      </div>
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`flex-1 rounded-full transition-all duration-300 ${
              level <= score ? barColor : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      {tips.length > 0 && score < 4 && (
        <p className="text-xs text-gray-500">Tip: {tips[0]}</p>
      )}
    </div>
  );
};

export default PassphraseStrength;
