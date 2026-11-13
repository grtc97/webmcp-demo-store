import { Photo } from './Photo'

function HeroAction({ action }) {
    if (action.href) {
        return (
            <a className="w-btn primary lg" href={action.href}>
                {action.label}
            </a>
        )
    }
    return (
        <button className="w-btn primary lg" onClick={action.onClick}>
            {action.label}
        </button>
    )
}

/** Big intro block: text on one side, photo on the other. Props: title, text, image, action = { label, onClick | href }. */
export function Hero({ title, text, image, action }) {
    return (
        <section className="w-hero">
            <div className="w-hero-text">
                <h1>{title}</h1>
                {text && <p>{text}</p>}
                {action && <HeroAction action={action} />}
            </div>
            <div className="w-hero-photo">
                <Photo src={image} alt="" w={1100} />
            </div>
        </section>
    )
}
