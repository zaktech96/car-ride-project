"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProjectDocsLanding() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = () => {
		setIsLoading(true);
		router.push("/docs");
	};

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
			<div className="max-w-3xl space-y-6">
				<span className="inline-flex items-center rounded-full border border-fd-border px-4 py-1 text-sm text-fd-muted-foreground">
					Project Documentation Workspace
				</span>
				<h1 className="text-4xl font-bold tracking-tight text-fd-foreground sm:text-5xl">
					Your single source of truth for this build
				</h1>
				<p className="text-lg text-fd-muted-foreground">
					Capture decisions, architecture, user journeys, and weekly learnings.
					Everything is structured and ready for your team to extend.
				</p>
				<button
					type="button"
					onClick={handleClick}
					disabled={isLoading}
					className="inline-flex items-center justify-center rounded-full bg-fd-foreground px-6 py-3 text-sm font-semibold text-fd-background shadow transition hover:bg-fd-foreground/90 disabled:opacity-70"
				>
					{isLoading ? (
						<>
							<span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
							Loading...
						</>
					) : (
						"Open project docs"
					)}
				</button>
			</div>
		</main>
	);
}
