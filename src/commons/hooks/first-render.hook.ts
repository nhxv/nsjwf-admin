import { useRef, useEffect } from "react";

export default function useFirstRender() {
  const firstRenderRef = useRef(true);

  useEffect(() => {
    firstRenderRef.current = false;
  }, []);

  return firstRenderRef.current;
}