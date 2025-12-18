'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- PASSWORD STRENGTH LOGIC (OWASP ALIGNED) ---
  const strengthMetrics = useMemo(() => {
    const pwd = formData.password;
    return {
      hasLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  }, [formData.password]);

  const strengthScore = useMemo(() => {
    return Object.values(strengthMetrics).filter(Boolean).length;
  }, [strengthMetrics]);

  const getStrengthColor = () => {
    if (strengthScore <= 2) return 'bg-red-500';
    if (strengthScore <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore <= 4) return 'Good';
    return 'Strong (OWASP Compliant)';
  };

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const isFormValid = 
    formData.firstName && 
    formData.lastName && 
    formData.email && 
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return; // Final safeguard

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      });

      const result = await response.json();
      if (response.ok) {
        router.push('/'); 
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Cannot connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo/Brand Area */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-500 mt-2">Join <span className="text-indigo-600 font-semibold">GadgetScout PH</span> today</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-white p-8 md:p-10">
          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">First Name</label>
                <input id="firstName" type="text" required placeholder="John" value={formData.firstName} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Last Name</label>
                <input id="lastName" type="text" required placeholder="Doe" value={formData.lastName} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 outline-none transition-all" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input id="email" type="email" required placeholder="name@example.com" value={formData.email} onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 outline-none transition-all" />
              </div>
            </div>

            {/* Password with Strength Meter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input id="password" type="password" required placeholder="••••••••" value={formData.password} onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 outline-none transition-all" />
              </div>
              
              {/* Strength Meter Bar */}
              {formData.password && (
                <div className="mt-2 space-y-2 px-1">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-gray-500">
                    <span>Strength: {getStrengthLabel()}</span>
                    <span>{strengthScore}/5</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div key={step} className={`h-full flex-1 transition-all duration-500 ${step <= strengthScore ? getStrengthColor() : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input id="confirmPassword" type="password" required placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword 
                    ? 'border-red-300 ring-1 ring-red-100' 
                    : 'border-gray-200 focus:ring-2 focus:ring-indigo-500'
                  }`} />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircleIcon className="absolute right-3.5 top-3.5 h-5 w-5 text-emerald-500" />
                )}
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 p-3.5 rounded-xl text-sm text-red-600">
                <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create My Account'}
            </button>
            
            <div className="pt-4 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <button type="button" onClick={() => router.push('/')} className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Sign in</button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}