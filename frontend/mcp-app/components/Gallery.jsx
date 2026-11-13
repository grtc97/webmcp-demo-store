import { useState } from 'react'

import { Photo } from '@storefront/widgets'

export function Gallery({ images, alt }) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    return (
        <div>
            <Photo src={images[selectedIndex]} alt={alt} w={800} ratio="4/3" />
            {images.length > 1 && (
                <div className="app-thumbs">
                    {images.map((src, index) => (
                        <button
                            key={src}
                            type="button"
                            className={index === selectedIndex ? 'on' : ''}
                            aria-label={`Photo ${index + 1}`}
                            onClick={() => setSelectedIndex(index)}
                        >
                            <Photo src={src} alt="" w={160} ratio="1/1" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
