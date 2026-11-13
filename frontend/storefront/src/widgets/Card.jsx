import { Photo } from './Photo'

/**
 * A content card. Works for products, recipes, events, people, anything with a picture and a title.
 * Props: image, alt, ratio, eyebrow, title, href, text, price, priceNote, badges (node),
 *        corner (node, top-right of the picture), actions (node, bottom).
 */
export function Card({ image, alt, ratio, eyebrow, title, href, text, price, priceNote, badges, corner, actions, ...rest }) {
    const TitleTag = href ? 'a' : 'span'
    const hasPrice = price != null

    return (
        <article className="w-card" {...rest}>
            <div className="w-card-media">
                {href ? (
                    <a href={href} tabIndex={-1} aria-hidden="true">
                        <Photo src={image} alt="" ratio={ratio} />
                    </a>
                ) : (
                    <Photo src={image} alt={alt || title} ratio={ratio} />
                )}
                {corner && <div className="w-card-corner">{corner}</div>}
            </div>
            <div className="w-card-body">
                {eyebrow && <span className="w-eyebrow">{eyebrow}</span>}
                <h3 className="w-card-title">
                    <TitleTag href={href}>{title}</TitleTag>
                </h3>
                {text && <p className="w-card-text">{text}</p>}
                {(hasPrice || badges) && (
                    <div className="w-card-meta">
                        {hasPrice && (
                            <strong className="w-price">
                                {price}
                                {priceNote && <small>{priceNote}</small>}
                            </strong>
                        )}
                        {badges}
                    </div>
                )}
                {actions && <div className="w-card-actions">{actions}</div>}
            </div>
        </article>
    )
}
