import { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({ children, threshold = 0.1, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, delay]);

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? 'revealed' : ''}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal; 