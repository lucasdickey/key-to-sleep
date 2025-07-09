"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

interface JobStatus {
  token: string;
  status: string;
  created_at: string;
  story_url?: string;
  estimated_completion?: string;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const jobToken = searchParams.get("job_token");
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobToken) {
      setError("No job token provided");
      setLoading(false);
      return;
    }

    // Check job status
    const checkJobStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/status?token=${jobToken}`);
        if (!response.ok) {
          throw new Error("Failed to fetch job status");
        }
        const data = await response.json();
        setJobStatus(data);
      } catch (err) {
        setError("Failed to fetch job status");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkJobStatus();
  }, [jobToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !jobStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md mx-4 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Oops!</h1>
          <p className="text-white/80 mb-6">
            {error || "Something went wrong. Please try again."}
          </p>
          <Link
            href="/"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-lg mx-4 text-center">
        <div className="text-green-400 text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
        
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">Your Story is Being Created</h2>
          <div className="text-white/80 space-y-2">
            <p>
              <strong>Job ID:</strong> {jobStatus.token.slice(0, 8)}...
            </p>
            <p>
              <strong>Status:</strong> <span className="capitalize">{jobStatus.status.replace("_", " ")}</span>
            </p>
            <p>
              <strong>Started:</strong> {new Date(jobStatus.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {jobStatus.status === "completed" && jobStatus.story_url ? (
          <div className="space-y-4">
            <div className="text-green-400 text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-semibold text-white">Your Story is Ready!</h3>
            <a
              href={jobStatus.story_url}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 inline-block"
            >
              Download Your Story
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-yellow-400 text-4xl mb-2">⏳</div>
            <h3 className="text-xl font-semibold text-white">Story in Progress</h3>
            <p className="text-white/80">
              Your personalized bedtime story is being crafted with love. 
              You&apos;ll receive an SMS notification when it&apos;s ready!
            </p>
            <div className="bg-blue-500/20 rounded-lg p-4 mt-4">
              <p className="text-blue-200 text-sm">
                ⚡ Estimated completion: ~3 minutes<br/>
                📱 SMS notification when ready<br/>
                🔄 You can bookmark this page to check status
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/20">
          <Link
            href="/"
            className="text-white/60 hover:text-white transition-colors"
          >
            ← Create Another Story
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}