'use client';

import { useRef, useEffect, useState } from 'react';

interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function useGestures(config: GestureConfig) {
  const elementRef = useRef<HTMLElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500
  } = config;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      setIsPressed(true);
      
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setTouchStart({
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now()
        });

        // Start long press timer
        if (onLongPress) {
          const timer = setTimeout(() => {
            onLongPress();
            setLongPressTimer(null);
          }, longPressDelay);
          setLongPressTimer(timer);
        }
      } else if (e.touches.length === 2 && onPinch) {
        // Handle pinch start
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        initialScale = 1;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Cancel long press on move
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      if (e.touches.length === 2 && onPinch && initialDistance > 0) {
        // Handle pinch
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        const scale = currentDistance / initialDistance;
        onPinch(scale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      setIsPressed(false);
      
      // Clear long press timer
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      if (!touchStart || e.touches.length > 0) return;

      const touch = e.changedTouches[0];
      const touchEnd = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      };

      const deltaX = touchEnd.x - touchStart.x;
      const deltaY = touchEnd.y - touchStart.y;
      const deltaTime = touchEnd.timestamp - touchStart.timestamp;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Check for tap (short distance, quick time)
      if (distance < threshold && deltaTime < 300) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTap;
        
        if (timeSinceLastTap < 300 && onDoubleTap) {
          // Double tap
          onDoubleTap();
          setLastTap(0);
        } else if (onTap) {
          // Single tap
          onTap();
          setLastTap(now);
        }
        return;
      }

      // Check for swipe gestures
      if (distance >= threshold) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      setTouchStart(null);
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    onLongPress,
    threshold,
    longPressDelay,
    touchStart,
    lastTap,
    longPressTimer
  ]);

  return {
    ref: elementRef,
    isPressed
  };
}

// Hook for swipe navigation
export function useSwipeNavigation(onNext?: () => void, onPrevious?: () => void) {
  return useGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    threshold: 100
  });
}

// Hook for pull-to-refresh
export function usePullToRefresh(onRefresh: () => void, threshold = 80) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const gestures = useGestures({
    onSwipeDown: () => {
      if (pullDistance > threshold) {
        onRefresh();
      }
      setIsPulling(false);
      setPullDistance(0);
    }
  });

  useEffect(() => {
    const element = gestures.ref.current;
    if (!element) return;

    let startY = 0;
    let isAtTop = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isAtTop = element.scrollTop === 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      if (distance > 0) {
        setIsPulling(true);
        setPullDistance(Math.min(distance, threshold * 2));
        
        // Prevent default scrolling when pulling
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [threshold, pullDistance]);

  return {
    ...gestures,
    isPulling,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1)
  };
}