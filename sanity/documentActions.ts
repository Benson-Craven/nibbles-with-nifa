import type {
  DocumentActionComponent,
  DocumentActionDescription,
} from "sanity";

const PRIVATE_RECIPE_EXPLANATION =
  "Ideas and Cooked drafts stay private. Move to Ready to publish once every public field is complete.";

const singletonActions = new Set(["publish", "discardChanges", "restore"]);
const singletonTypes = new Set(["creatorProfile"]);

export function isSingletonType(schemaType: string) {
  return singletonTypes.has(schemaType);
}

export function recipePublishState(document?: unknown) {
  const editorialStage =
    document && typeof document === "object"
      ? (document as { editorialStage?: unknown }).editorialStage
      : undefined;

  if (editorialStage === "ready") {
    return { canPublish: true } as const;
  }

  return {
    canPublish: false,
    label: "Private draft",
    title: PRIVATE_RECIPE_EXPLANATION,
  } as const;
}

export function recipePublishActionDescription(
  description: DocumentActionDescription | null,
  document?: unknown,
): DocumentActionDescription | null {
  if (!description) return null;

  const state = recipePublishState(document);
  if (state.canPublish) return description;

  return {
    ...description,
    disabled: true,
    label: state.label,
    title: state.title,
  };
}

function protectRecipePublishAction(
  previousAction: DocumentActionComponent,
): DocumentActionComponent {
  const RecipePublishAction: DocumentActionComponent = (props) =>
    recipePublishActionDescription(
      previousAction(props),
      props.draft ?? props.version ?? props.published,
    );

  RecipePublishAction.action = previousAction.action;
  RecipePublishAction.displayName = "RecipePublishAction";
  return RecipePublishAction;
}

export function resolveDocumentActions(
  previousActions: DocumentActionComponent[],
  schemaType: string,
) {
  if (isSingletonType(schemaType)) {
    return previousActions.filter(
      ({ action }) => action && singletonActions.has(action),
    );
  }

  if (schemaType === "recipe") {
    return previousActions.map((previousAction) =>
      previousAction.action === "publish"
        ? protectRecipePublishAction(previousAction)
        : previousAction,
    );
  }

  return previousActions;
}
