import { isRouteErrorResponse, useRouteError } from "react-router";

function AppErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-page flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-destructive">Oops! Something went wrong</h1>
          <p className="text-lg text-muted-foreground">Status: {error.status}</p>
          <p className="text-muted-foreground">{error.statusText}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="error-page flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-destructive">Oops! Something went wrong</h1>
        <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// Simple error boundary without Sentry integration
// For Convex backend errors: Use built-in exception reporting via Dashboard
// See: https://docs.convex.dev/production/integrations/exception-reporting
export const ErrorBoundary = AppErrorBoundary;