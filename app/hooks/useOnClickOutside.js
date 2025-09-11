import { useEffect } from "react";

/**
 * Custom hook that triggers a callback when a click or touch event occurs outside of the referenced element.
 *
 * @param {React.RefObject} ref - The ref of the element to monitor.
 * @param {Function} handler - The function to call on an outside click/touch.
 */
export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}