import type { ComponentType } from "react";
import { VisualEditing } from "next-sanity/visual-editing";

import { isDraftPreviewEnabled } from "@/lib/draft-preview";

type DraftModeVisualEditingRuntime = {
  isDraftModeEnabled: () => Promise<boolean>;
  VisualEditingComponent: ComponentType;
};

const defaultRuntime: DraftModeVisualEditingRuntime = {
  isDraftModeEnabled: isDraftPreviewEnabled,
  VisualEditingComponent: VisualEditing,
};

export function createDraftModeVisualEditing(
  runtime: DraftModeVisualEditingRuntime = defaultRuntime,
) {
  return async function DraftModeVisualEditing() {
    if (!(await runtime.isDraftModeEnabled())) return null;

    return <runtime.VisualEditingComponent />;
  };
}

export const DraftModeVisualEditing = createDraftModeVisualEditing();
