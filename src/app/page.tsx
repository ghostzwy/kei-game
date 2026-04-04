'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="text-[#00ff41] font-mono text-lg animate-pulse">
          [INITIALIZING KEI OS...]
        </div>
      </div>
    </div>
  );
}
