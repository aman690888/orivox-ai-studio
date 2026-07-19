import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePresentation, PresentationUi } from "@/lib/database/presentations";
import { saveSlides } from "@/lib/database/slides";
import { Slide } from "@/lib/mock";
import { useAutosave } from "./useAutosave";

interface SyncPayload {
  title: string;
  slides: Slide[];
}

interface SyncContext {
  previousPresentation: PresentationUi | undefined;
  previousSlides: Slide[] | undefined;
}

export function usePresentationSync(presentationId: string) {
  const queryClient = useQueryClient();

  const syncMutation = useMutation<void, Error, SyncPayload, SyncContext>({
    mutationFn: async (payload: SyncPayload) => {
      await Promise.all([
        updatePresentation(presentationId, { title: payload.title }),
        saveSlides(presentationId, payload.slides),
      ]);
    },
    onMutate: async (newPayload) => {
      // Cancel outgoing queries to avoid overriding optimistic updates
      await queryClient.cancelQueries({ queryKey: ["presentation", presentationId] });
      await queryClient.cancelQueries({ queryKey: ["slides", presentationId] });

      // Snapshot the previous values for rollback
      const previousPresentation = queryClient.getQueryData<PresentationUi>([
        "presentation",
        presentationId,
      ]);
      const previousSlides = queryClient.getQueryData<Slide[]>(["slides", presentationId]);

      // Optimistically update client cache
      queryClient.setQueryData<PresentationUi>(["presentation", presentationId], (old) => {
        if (!old) return old;
        return { ...old, title: newPayload.title };
      });
      queryClient.setQueryData<Slide[]>(["slides", presentationId], newPayload.slides);

      return { previousPresentation, previousSlides };
    },
    onError: (_err, _newPayload, context) => {
      // Rollback on failure
      if (context) {
        queryClient.setQueryData(["presentation", presentationId], context.previousPresentation);
        queryClient.setQueryData(["slides", presentationId], context.previousSlides);
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh with database sources
      queryClient.invalidateQueries({ queryKey: ["presentation", presentationId] });
      queryClient.invalidateQueries({ queryKey: ["slides", presentationId] });
    },
  });

  const { triggerSave, retry, status, isOnline } = useAutosave<SyncPayload>({
    saveFn: (payload) => syncMutation.mutateAsync(payload),
    delay: 800,
  });

  return {
    sync: triggerSave,
    retry,
    status,
    isOnline,
  };
}
