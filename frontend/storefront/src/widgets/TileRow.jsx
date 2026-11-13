import { Photo } from './Photo'

/** A row of picture tiles (categories, collections, authors...). Props: items = [{ key, label, image, note, onClick }]. */
export function TileRow({ items }) {
    return (
        <div className="w-tiles">
            {items.map((tile) => (
                <button key={tile.key ?? tile.label} className="w-tile" onClick={tile.onClick}>
                    <Photo src={tile.image} alt="" w={400} ratio="4/5" />
                    <span className="w-tile-label">
                        {tile.label}
                        {tile.note && <small>{tile.note}</small>}
                    </span>
                </button>
            ))}
        </div>
    )
}
