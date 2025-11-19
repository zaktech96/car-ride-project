"use client";
import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";

export default function WelcomeBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const hasWelcome = url.searchParams.get("welcome");
    const flag = localStorage.getItem("kaizen_docs_welcome_shown");
    if (hasWelcome && !flag) {
      setShow(true);
      localStorage.setItem("kaizen_docs_welcome_shown", "1");
      url.searchParams.delete("welcome");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  if (!show) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] max-w-xl w-[90%]">
      <div className="rounded-lg border border-fd-border bg-fd-card shadow-xl">
        <div className="px-4 py-3 flex items-start gap-3">
          <div className="mt-0.5">
            <Rocket className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1 text-sm">
            <p className="font-semibold">Welcome aboard! 🎉</p>
            <p className="text-fd-muted-foreground">
              Your purchase was successful. You now have access to the Accelerator docs.
              Manage billing and benefits any time from the Billing page.
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="rounded-md px-2 py-1 text-xs border hover:bg-fd-muted"
          >
            Dismiss
          </button>
        </div>
        <div className="px-4 pb-4">
          <a
            href="/billing"
            className="inline-flex items-center text-xs font-medium underline text-fd-muted-foreground hover:text-fd-foreground"
          >
            Go to Billing / Customer Portal →
          </a>
        </div>
      </div>
    </div>
  );
}


