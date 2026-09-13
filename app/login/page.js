'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

const OWNER_PIN = '0000';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (pin === OWNER_PIN) {
      sessionStorage.setItem('nandanam_auth', 'true');
      router.push('/update-price');
    } else {
      setError('Invalid PIN');
      setPin('');
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-kerala-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <Lock className="mx-auto mb-3 text-kerala-red" size={40} />
          <h1 className="text-xl font-bold text-kerala-charcoal">Owner Access</h1>
          <p className="text-sm text-gray-500 mt-1">Enter PIN to manage menu prices</p>
        </div>

        <div className="flex justify-center gap-3 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              type="password"
              maxLength={1}
              value={pin[i] || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                const newPin = pin.slice(0, i) + val + pin.slice(i + 1);
                setPin(newPin);
                if (val && i < 3) {
                  document.getElementById(`pin-${i + 1}`)?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
                if (e.key === 'Backspace' && !pin[i] && i > 0) {
                  document.getElementById(`pin-${i - 1}`)?.focus();
                }
              }}
              id={`pin-${i}`}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-kerala-red focus:outline-none"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3 font-semibold">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={pin.length < 4}
          className="w-full bg-kerala-red text-white py-3 rounded-xl font-bold text-sm hover:bg-kerala-redHover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
