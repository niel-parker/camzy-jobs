'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';

export default function CandidateRegistrationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-4 max-w-sm p-8 rounded-3xl theme-surface border theme-border shadow-xl">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-base font-black theme-text">Unified Sign In & Registration</h2>
        <p className="text-xs theme-muted leading-relaxed">
          Sign-in and candidate registration are now merged into one simplified OTP flow. Redirecting to quick login...
        </p>
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mx-auto" />
      </div>
    </div>
  );
}
