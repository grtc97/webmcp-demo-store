import { useState } from 'react'

import { STOCK_STATUS_LABELS } from '@storefront/utils/format'

import { useRun } from '../hooks/useStore'

const STATUS_OPTIONS = [['', 'Any availability'], ...Object.entries(STOCK_STATUS_LABELS)]
const SORT_OPTIONS = [
    ['relevance', 'Relevance'],
    ['price_asc', 'Price: low to high'],
    ['price_desc', 'Price: high to low'],
    ['name', 'Name'],
]
const PRICE_KEYS = ['min_price', 'max_price']

// Only the filters the user actually set are sent to the tool.
function buildSearchArgs(filters) {
    const args = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '' && !(key === 'sort' && value === 'relevance')),
    )
    for (const key of PRICE_KEYS) {
        if (key in args) {
            args[key] = Number(args[key])
        }
    }
    return args
}

export function FilterForm({ filters, categories }) {
    const { run, busy } = useRun()
    const [form, setForm] = useState(filters)

    const updateField = (key) => (event) => setForm({ ...form, [key]: event.target.value })

    function submit(event) {
        event.preventDefault()
        run('search_products', buildSearchArgs(form))
    }

    function renderSelect(key, label, options) {
        return (
            <label>
                {label}
                <select value={form[key]} onChange={updateField(key)}>
                    {options.map(([value, optionLabel]) => (
                        <option key={value} value={value}>
                            {optionLabel}
                        </option>
                    ))}
                </select>
            </label>
        )
    }

    return (
        <form className="app-form" onSubmit={submit}>
            <label>
                Search
                <input type="search" value={form.query} onChange={updateField('query')} placeholder="headphones, 40 hour battery…" />
            </label>
            {renderSelect('category', 'Category', [['', 'All categories'], ...categories.map((category) => [category, category])])}
            {renderSelect('status', 'Availability', STATUS_OPTIONS)}
            <label>
                Min ₹
                <input type="number" min="0" value={form.min_price} onChange={updateField('min_price')} />
            </label>
            <label>
                Max ₹
                <input type="number" min="0" value={form.max_price} onChange={updateField('max_price')} />
            </label>
            {renderSelect('sort', 'Sort', SORT_OPTIONS)}
            <button className="w-btn primary" disabled={!!busy}>
                Search
            </button>
            <button type="button" className="w-btn outline" disabled={!!busy} onClick={() => run('search_products', {})}>
                Clear filters
            </button>
        </form>
    )
}
