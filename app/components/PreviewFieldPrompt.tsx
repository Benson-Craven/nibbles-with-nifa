export function PreviewFieldPrompt({
  as: Element = "p",
  children,
}: {
  as?: "h1" | "p";
  children: string;
}) {
  return (
    <Element className="preview-field-prompt" data-preview-only="true">
      {children}
    </Element>
  );
}
