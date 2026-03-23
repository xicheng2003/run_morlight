import type { PropsWithChildren, ReactNode } from 'react';

interface SectionShellProps extends PropsWithChildren {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'between';
  className?: string;
  bodyClassName?: string;
}

const SectionShell = ({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className = '',
  bodyClassName = '',
  children,
}: SectionShellProps) => (
  <section className={`section-shell ${className}`.trim()}>
    <div
      className={`section-shell__header ${
        align === 'between' ? 'sm:flex-row sm:items-end' : ''
      }`}
    >
      <div className="flex flex-col gap-3">
        {eyebrow ? <span className="section-shell__eyebrow">{eyebrow}</span> : null}
        <div className="space-y-2">
          <h2 className="section-shell__title">{title}</h2>
          {subtitle ? (
            <p className="max-w-3xl text-sm leading-7 text-white/55 sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {align === 'between' ? (
        <div className="hidden h-px flex-1 bg-gradient-to-r from-white/12 to-transparent sm:ml-10 sm:block" />
      ) : null}
    </div>
    <div className={bodyClassName}>{children}</div>
  </section>
);

export default SectionShell;
