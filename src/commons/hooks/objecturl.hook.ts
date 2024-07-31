import { useEffect, useState } from "react";

/**
 * A Hook to generate Object URL with proper cleanup.
 * A new URL is generated whenever `state` itself is updated. Therefore, `state` should
 * be a React state.
 *
 * @param state Must be a `Blob` or `MediaSource` and must be a React state.
 * @returns The object's URL.
 */
export function useStateURL(state: Blob | File | MediaSource | null) {
  const [objectURL, setObjectURL] = useState<string>(null);

  useEffect(() => {
    if (!state) return;
    const url = URL.createObjectURL(state);
    setObjectURL(url);

    return () => {
      URL.revokeObjectURL(objectURL);
      setObjectURL(null);
    };
  }, [state]);

  return objectURL;
}
