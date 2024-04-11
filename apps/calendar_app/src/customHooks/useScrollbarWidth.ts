import { useState, useEffect } from 'react';

// Hook to calculate the scrollbar width
const useScrollbarWidth = (ref) => {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    const calculateScrollbarWidth = () => {
      if (ref.current) {
        const width = ref.current.offsetWidth - ref.current.clientWidth;
        setScrollbarWidth(width);
      }
    };

    // Initial calculation
    calculateScrollbarWidth();

    // Set up a MutationObserver to watch for changes in the content
    const observer = new MutationObserver(calculateScrollbarWidth);
    if (ref.current) {
      observer.observe(ref.current, {
        childList: true, // observe direct children
        subtree: true, // observe lower descendants too
        characterData: true, // observe text changes
      });
    }

    
    return () => observer.disconnect(); // Clean up observer on component unmount
  }, [ref]);

  return scrollbarWidth;
};

export default useScrollbarWidth;