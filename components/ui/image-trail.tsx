"use client";

import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode, RefObject } from "react";
import {
  AnimationSequence,
  motion,
  Target,
  Transition,
  useAnimate,
  useAnimationFrame,
} from "motion/react";

import { useMouseVector } from "@/components/hooks/use-mouse-vector";

type TrailSegment = [Target, Transition];

type TrailAnimationSequence = TrailSegment[];

interface ImageTrailProps {
  children: ReactNode;
  containerRef?: RefObject<HTMLElement | null>;
  newOnTop?: boolean;
  rotationRange?: number;
  animationSequence?: TrailAnimationSequence;
  interval?: number;
}

interface TrailItem {
  id: string;
  x: number;
  y: number;
  rotation: number;
  animationSequence: TrailAnimationSequence;
  scale: number;
  child: ReactNode;
}

function createTrailItemId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const ImageTrail = ({
  children,
  newOnTop = true,
  rotationRange = 15,
  containerRef,
  animationSequence = [
    [{ scale: 1.2 }, { duration: 0.1, ease: "circOut" }],
    [{ scale: 0 }, { duration: 0.5, ease: "circIn" }],
  ],
  interval = 100,
}: ImageTrailProps) => {
  const [trailItems, setTrailItems] = useState<TrailItem[]>([]);

  const lastAddedTimeRef = useRef<number>(0);
  const { position: mousePosition } = useMouseVector(containerRef);
  const lastMousePosRef = useRef(mousePosition);
  const currentIndexRef = useRef(0);
  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  const addToTrail = useCallback(
    (mousePos: { x: number; y: number }) => {
      if (childrenArray.length === 0) {
        return;
      }

      const newItem: TrailItem = {
        id: createTrailItemId(),
        x: mousePos.x,
        y: mousePos.y,
        rotation: (Math.random() - 0.5) * rotationRange * 2,
        animationSequence,
        scale: 1,
        child: childrenArray[currentIndexRef.current],
      };

      currentIndexRef.current =
        (currentIndexRef.current + 1) % childrenArray.length;

      if (newOnTop) {
        setTrailItems((items) => [...items, newItem]);
      } else {
        setTrailItems((items) => [newItem, ...items]);
      }
    },
    [childrenArray, rotationRange, animationSequence, newOnTop],
  );

  const removeFromTrail = useCallback((itemId: string) => {
    setTrailItems((items) => items.filter((item) => item.id !== itemId));
  }, []);

  useAnimationFrame((time) => {
    if (
      lastMousePosRef.current.x === mousePosition.x &&
      lastMousePosRef.current.y === mousePosition.y
    ) {
      return;
    }
    lastMousePosRef.current = mousePosition;

    const currentTime = time;

    if (currentTime - lastAddedTimeRef.current < interval) {
      return;
    }

    lastAddedTimeRef.current = currentTime;

    addToTrail(mousePosition);
  });

  return (
    <div className="pointer-events-none relative h-full w-full">
      {trailItems.map((item) => (
        <TrailItem key={item.id} item={item} onComplete={removeFromTrail} />
      ))}
    </div>
  );
};

interface TrailItemProps {
  item: TrailItem;
  onComplete: (id: string) => void;
}

const TrailItem = ({ item, onComplete }: TrailItemProps) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const sequence = item.animationSequence.map((segment: TrailSegment) => [
      scope.current,
      ...segment,
    ]);

    animate(sequence as AnimationSequence).then(() => {
      onComplete(item.id);
    });
  }, [animate, item.animationSequence, item.id, onComplete, scope]);

  return (
    <motion.div
      ref={scope}
      key={item.id}
      className="absolute"
      style={{
        left: item.x,
        top: item.y,
        rotate: item.rotation,
      }}
    >
      {item.child}
    </motion.div>
  );
};

export { ImageTrail };
