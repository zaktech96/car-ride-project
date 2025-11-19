import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { FileText } from 'lucide-react';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions()}
      nav={{
        title: 'Project Documentation',
        url: '/docs/project-documentation',
      }}
      sidebar={{
        tabs: [
          {
            title: 'Project Documentation',
            description:
              'Document your idea, decisions, and technical architecture',
            url: '/docs/project-documentation',
            icon: <FileText />,
          },
        ],
        footer: undefined,
      }}
    >
      {children}
    </DocsLayout>
  );
}
