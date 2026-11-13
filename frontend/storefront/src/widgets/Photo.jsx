import { useEffect, useState } from 'react'

import { Image as ImageIcon } from 'lucide-react'

const UNSPLASH_HOST = 'images.unsplash.com'

function isUnsplashUrl(src) {
    return Boolean(src) && src.includes(UNSPLASH_HOST)
}

// Unsplash links are resized by query string; any other URL is used as-is.
export function photoUrl(src, width = 600) {
    return isUnsplashUrl(src) ? `${src.split('?')[0]}?w=${width}&q=70&auto=format&fit=crop` : src
}

/** An image that never leaves a broken-image icon behind. Props: src, alt, w (px, for resizing), ratio ("4/3"), className. */
export function Photo({ src, alt = '', w: width = 600, ratio, className = '' }) {
    const [hasFailed, setHasFailed] = useState(false)
    useEffect(() => setHasFailed(false), [src])
    const style = ratio ? { aspectRatio: ratio } : undefined

    if (!src || hasFailed) {
        return (
            <div className={'w-photo w-photo-empty ' + className} style={style} role="img" aria-label={alt}>
                <ImageIcon strokeWidth={1.2} />
            </div>
        )
    }

    const srcSet = isUnsplashUrl(src) ? `${photoUrl(src, width)} 1x, ${photoUrl(src, width * 2)} 2x` : undefined
    return (
        <img
            className={'w-photo ' + className}
            style={style}
            src={photoUrl(src, width)}
            srcSet={srcSet}
            alt={alt}
            loading="lazy"
            onError={() => setHasFailed(true)}
        />
    )
}
