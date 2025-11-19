import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

// Toggle: enable the AI Engineering tab (true = live link, false = disabled/coming soon)
export const aiTabEnabled: boolean = false;

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <img src="/logo.png" alt="Accelerator" className="w-8 h-8" />
          Accelerator
        </>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [],
  };
}
