import React from "react";


export function useDragScroll(speed =  1, friction = 0.92) {
    const ref = React.useRef<HTMLDivElement | null>(null);

    let isDragging = React.useRef(false);
    const startX = React.useRef(0);
    const scrollLeft = React.useRef(0);
    const velocity = React.useRef(0);
    const animationFrame = React.useRef<number | null>(null);

    const stopAnimation = () => {
        if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
    };

    const animate = () => {
        if (!ref.current) return;
        ref.current.scrollLeft += velocity.current;
        velocity.current *= friction;

        if (Math.abs(velocity.current) > 0.5) {
            animationFrame.current = requestAnimationFrame(animate);
        }
    }


    function onMouseDown(e: React.MouseEvent) {
        if (!ref.current) return;
        isDragging.current = true;
        startX.current = e.pageX - ref.current.offsetLeft;
        scrollLeft.current = ref.current.scrollLeft;

        stopAnimation();
        ref.current.classList.add('dragging');
    }

    function onMouseLeave() {
        if (!ref.current) return;
        isDragging.current = false;
        ref.current.classList.remove('dragging');
    }

    function onMouseUp() {
        if (!ref.current) return;
        isDragging.current = false;
        ref.current.classList.remove('dragging');

        // Start inertia animation
        animate();
    }

    function onMouseMove(e: React.MouseEvent) {
        if (!ref.current || !isDragging.current) return;
        e.preventDefault();
        const x = e.pageX - ref.current.offsetLeft;
        const walk = (x - startX.current) * speed; //scroll-fast
        velocity.current = walk - (ref.current.scrollLeft - scrollLeft.current);

        ref.current.scrollLeft = scrollLeft.current - walk;
    }

    return {
        ref,
        onMouseDown,
        onMouseLeave,
        onMouseUp,
        onMouseMove
    };
}
