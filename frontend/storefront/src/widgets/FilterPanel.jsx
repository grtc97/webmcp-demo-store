import { useState } from 'react'

const WIDE_SCREEN_QUERY = '(min-width: 901px)'

function RadioField({ field, values, onPatch }) {
    return field.options.map((option) => (
        <label key={option.value} className="w-radio">
            <input
                type="radio"
                name={field.key}
                checked={values[field.key] === option.value}
                onChange={() => onPatch({ [field.key]: option.value })}
            />
            {option.label}
        </label>
    ))
}

function RangeField({ field, values, onPatch }) {
    return (
        <div className="w-pair">
            {field.keys.map((key, index) => (
                <input
                    key={key}
                    type="number"
                    min="0"
                    placeholder={field.placeholders?.[index]}
                    aria-label={`${field.label} ${field.placeholders?.[index] || key}`}
                    value={values[key]}
                    onChange={(event) => onPatch({ [key]: event.target.value })}
                />
            ))}
        </div>
    )
}

function TextField({ field, values, onPatch }) {
    return (
        <input
            type="search"
            value={values[field.key]}
            onChange={(event) => onPatch({ [field.key]: event.target.value })}
            placeholder={field.placeholder}
        />
    )
}

/**
 * Filters described as data, so the same panel filters products, recipes, tickets...
 * fields = [
 *   { type: 'radio', key: 'category', label: 'Category', options: [{ value: '', label: 'All' }, ...] },
 *   { type: 'range', label: 'Price', keys: ['min', 'max'], placeholders: ['Min', 'Max'] },
 *   { type: 'text',  key: 'q', label: 'Search' },
 * ]
 * values = { category: '', min: '', max: '', q: '' }   onChange(nextValues)   onClear()
 */
export function FilterPanel({ title = 'Filters', fields, values, onChange, onClear }) {
    // Open on wide screens, folded on phones.
    const [isOpen, setIsOpen] = useState(() => window.matchMedia(WIDE_SCREEN_QUERY).matches)
    const applyPatch = (patch) => onChange({ ...values, ...patch })

    return (
        <aside className="w-filters" aria-label={title}>
            <button type="button" className="w-filters-toggle" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>
                {title}
                <span>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
                <>
                    {fields.map((field) => (
                        <fieldset key={field.key || field.keys.join()}>
                            <legend>{field.label}</legend>
                            {field.type === 'radio' && <RadioField field={field} values={values} onPatch={applyPatch} />}
                            {field.type === 'range' && <RangeField field={field} values={values} onPatch={applyPatch} />}
                            {field.type === 'text' && <TextField field={field} values={values} onPatch={applyPatch} />}
                        </fieldset>
                    ))}
                    {onClear && (
                        <button className="w-btn outline" onClick={onClear}>
                            Clear all
                        </button>
                    )}
                </>
            )}
        </aside>
    )
}
