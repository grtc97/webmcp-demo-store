import { useRef } from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'

// How much of the visible width one arrow click scrolls.
const SCROLL_STEP = 0.8

/** Horizontal scroller with arrow buttons. Props: title, children (any items; give them a fixed width in CSS or inline). */
export function Carousel({ title, children }) {
    const trackRef = useRef(null)

    function scrollByPage(direction) {
        const track = trackRef.current
        track?.scrollBy({ left: direction * track.clientWidth * SCROLL_STEP, behavior: 'smooth' })
    }

    return (
        <section className="w-carousel">
            <div className="w-carousel-head">
                {title && <h2>{title}</h2>}
                <div>
                    <button aria-label="Scroll left" onClick={() => scrollByPage(-1)}>
                        <ChevronLeft size={18} />
                    </button>
                    <button aria-label="Scroll right" onClick={() => scrollByPage(1)}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
            <div className="w-carousel-track" ref={trackRef}>
                {children}
            </div>
        </section>
    )
}
