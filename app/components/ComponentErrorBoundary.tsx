import React from "react";

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ComponentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary for individual components
 * Prevents one component failure from breaking the entire page
 */
export class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ComponentErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error("Component error caught by boundary:", error, errorInfo);
    }
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Return custom fallback if provided
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      
      // Default fallback - render nothing (component silently fails)
      return null;
    }

    return this.props.children;
  }
}

// Convenience wrapper component
export function ErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <ComponentErrorBoundary fallback={fallback}>
      {children}
    </ComponentErrorBoundary>
  );
}

