import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

export const useRateLimiting = ({ maxRequests, windowMs, identifier = 'default' }: RateLimitConfig) => {
  const requestTimestamps = useRef<number[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Remove timestamps outside the current window
    requestTimestamps.current = requestTimestamps.current.filter(
      timestamp => timestamp > windowStart
    );
    
    // Check if we've exceeded the limit
    if (requestTimestamps.current.length >= maxRequests) {
      if (!isBlocked) {
        setIsBlocked(true);
        toast.error(`Rate limit exceeded. Please wait ${Math.ceil(windowMs / 1000)} seconds.`);
        
        // Reset block after window expires
        setTimeout(() => setIsBlocked(false), windowMs);
      }
      return false;
    }
    
    // Add current request timestamp
    requestTimestamps.current.push(now);
    return true;
  };

  const getRemainingRequests = (): number => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const activeRequests = requestTimestamps.current.filter(
      timestamp => timestamp > windowStart
    ).length;
    
    return Math.max(0, maxRequests - activeRequests);
  };

  const getResetTime = (): number => {
    if (requestTimestamps.current.length === 0) return 0;
    const oldestRequest = Math.min(...requestTimestamps.current);
    return Math.max(0, (oldestRequest + windowMs) - Date.now());
  };

  return {
    checkRateLimit,
    getRemainingRequests,
    getResetTime,
    isBlocked
  };
};