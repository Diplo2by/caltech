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
      // Do nothing if the click is inside the ref's element or its descendants
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      // Trigger the handler function
      handler(event);
    };

    // Add event listeners for both mouse and touch events
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    // Cleanup function to remove the event listeners when the component unmounts
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]); // Re-run the effect if the ref or handler function changes
}