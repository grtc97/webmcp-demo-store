export function CategoryNav({ categories, activeCategory, onPick }) {
    return (
        <nav className="catnav" aria-label="Categories">
            <button className={!activeCategory ? 'on' : ''} onClick={() => onPick('')}>
                All
            </button>
            {categories.map((category) => (
                <button key={category} className={activeCategory === category ? 'on' : ''} onClick={() => onPick(category)}>
                    {category}
                </button>
            ))}
        </nav>
    )
}
