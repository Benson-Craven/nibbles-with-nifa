export function PreviewFieldPrompt({ children }: { children: string }) {
  return (
    <p className="preview-field-prompt" data-preview-only="true">
      {children}
    </p>
  );
}
