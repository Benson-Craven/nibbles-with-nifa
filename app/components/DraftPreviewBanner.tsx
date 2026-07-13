type DraftPreviewBannerProps = {
  exitPath: string;
};

export function DraftPreviewBanner({ exitPath }: DraftPreviewBannerProps) {
  const exitHref = `/api/draft-mode/disable?returnTo=${encodeURIComponent(exitPath)}`;

  return (
    <aside
      aria-label="Draft preview"
      className="draft-preview"
      role="status"
    >
      <div className="draft-preview__inner shell">
        <p>
          <strong>Unpublished preview</strong>
          <span>Only authorized Studio users can see this draft.</span>
        </p>
        <a href={exitHref}>Exit preview</a>
      </div>
    </aside>
  );
}
