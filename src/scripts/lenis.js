import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenisInstance;
let tickerCallback;

export function getLenis() {
  return lenisInstance;
}

export function initLenis() {
  if (lenisInstance || typeof window === 'undefined') {
    return lenisInstance;
  }

  gsap.registerPlugin(ScrollTrigger);

  lenisInstance = new Lenis({
    duration: 1.2,
    wheelMultiplier: 0.6,
    touchMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
  });

  lenisInstance.on('scroll', ScrollTrigger.update);

  tickerCallback = (time) => {
    lenisInstance?.raf(time * 1000);
  };
  gsap.ticker.add(tickerCallback);

  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
}

export function destroyLenis() {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = undefined;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = undefined;
  }
}
