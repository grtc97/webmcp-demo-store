import { useState } from 'react'

import { Bell, CalendarDays } from 'lucide-react'

import { unsplashUrl } from '../utils/format'
import {
    Badge,
    Card,
    CardGrid,
    Carousel,
    DataTable,
    FilterPanel,
    Hero,
    ListRow,
    NotificationList,
    SectionHeader,
    Stat,
    StatRow,
    Stepper,
    TileRow,
} from '../widgets'

// None of the data below comes from the store. These are the same widgets the shop uses.
const RECIPES = [
    { id: 1, name: 'Masala chai', time: 10, level: 'Easy', diet: 'Veg', img: unsplashUrl('1576092768241-dec231879fc3') },
    { id: 2, name: 'Almond energy bowl', time: 5, level: 'Easy', diet: 'Vegan', img: unsplashUrl('1543158181-1274e5362710') },
    { id: 3, name: 'One-pan veg stir fry', time: 25, level: 'Medium', diet: 'Vegan', img: unsplashUrl('1466637574441-749b8f19452f') },
    { id: 4, name: 'Weekend dal tadka', time: 40, level: 'Medium', diet: 'Veg', img: unsplashUrl('1597481499666-130f8eb2c9cd') },
]

const TASKS = [
    { id: 1, task: 'Write release notes', owner: 'A', status: 'Done' },
    { id: 2, task: 'Dry run on a clean laptop', owner: 'B', status: 'In progress' },
    { id: 3, task: 'Record backup demo video', owner: 'C', status: 'To do' },
]

const TASK_STATUS_TONES = { Done: 'good', 'In progress': 'warn', 'To do': 'neutral' }

const TASK_COLUMNS = [
    { key: 'task', header: 'Task' },
    { key: 'owner', header: 'Owner' },
    { key: 'status', header: 'Status', render: (task) => <Badge tone={TASK_STATUS_TONES[task.status]}>{task.status}</Badge> },
]

const RECIPE_FILTER_FIELDS = [
    {
        type: 'radio',
        key: 'diet',
        label: 'Diet',
        options: [
            { value: '', label: 'Any' },
            { value: 'Veg', label: 'Vegetarian' },
            { value: 'Vegan', label: 'Vegan' },
        ],
    },
    { type: 'range', label: 'Minutes', keys: ['min', 'max'], placeholders: ['Min', 'Max'] },
]

const EMPTY_RECIPE_FILTERS = { diet: '', min: '', max: '' }

const CUISINE_TILES = [
    { label: 'Tea and chai', image: unsplashUrl('1576092768241-dec231879fc3'), note: '12 recipes' },
    { label: 'Snacks', image: unsplashUrl('1543158181-1274e5362710'), note: '9 recipes' },
    { label: 'Mains', image: unsplashUrl('1466637574441-749b8f19452f'), note: '21 recipes' },
    { label: 'Baking', image: unsplashUrl('1597481499666-130f8eb2c9cd'), note: '7 recipes' },
]

const RELEASE_NOTES = [
    { id: 1, title: 'Build passed', message: 'main is green, ready for the dry run.', time: '2 min ago', icon: <Bell size={18} /> },
    {
        id: 2,
        title: 'Backup video uploaded',
        message: 'Recorded on Friday evening.',
        time: '1 h ago',
        read: true,
        icon: <Bell size={18} />,
    },
]

const CODE_SAMPLES = {
    card: `<CardGrid min={220}>\n  {items.map((r) => (\n    <Card key={r.id} image={r.img} title={r.name} eyebrow={r.diet}\n      price={r.time + ' min'} badges={<Badge>{r.level}</Badge>} />\n  ))}\n</CardGrid>`,
    filterPanel: `const fields = [\n  { type: 'radio', key: 'diet', label: 'Diet', options: [...] },\n  { type: 'range', label: 'Minutes', keys: ['min', 'max'] },\n]\n<FilterPanel fields={fields} values={f} onChange={setF} onClear={...} />`,
    dataTable: `<DataTable rows={tasks} columns={[\n  { key: 'task', header: 'Task' },\n  { key: 'status', header: 'Status', render: (t) => <Badge tone="good">{t.status}</Badge> },\n]} />`,
    hero: `<Hero title="Cook something new" text="..." image={url} action={{ label: 'Browse recipes', href: '#/' }} />`,
    carousel: `<Carousel title="Cuisines">\n  <TileRow items={[{ label: 'North Indian', image: url, onClick }]} />\n</Carousel>`,
    listRow: `<ListRow image={url} title="Pune AI meetup" meta="Sat, 10 am"\n  right={<Stepper value={qty} max={6} onChange={setQty} />} />`,
    notifications: `<NotificationList items={[{ id, title, message, time, read, icon }]} onOpen={...} />`,
}

function isBlank(value) {
    return value === ''
}

function filterRecipes(recipes, filters) {
    return recipes.filter(
        (recipe) =>
            (!filters.diet || recipe.diet === filters.diet) &&
            (isBlank(filters.min) || recipe.time >= +filters.min) &&
            (isBlank(filters.max) || recipe.time <= +filters.max),
    )
}

function ShowcaseBlock({ title, note, code, children }) {
    return (
        <section className="gal-block">
            <SectionHeader title={title} sub={note} />
            <div className="gal-demo">{children}</div>
            <pre>
                <code>{code}</code>
            </pre>
        </section>
    )
}

export function ComponentLibraryPage() {
    const [recipeFilters, setRecipeFilters] = useState(EMPTY_RECIPE_FILTERS)
    const [seats, setSeats] = useState(2)
    const shownRecipes = filterRecipes(RECIPES, recipeFilters)
    const doneTaskCount = TASKS.filter((task) => task.status === 'Done').length

    return (
        <section className="page wide">
            <h1>Component library</h1>
            <p className="lead">
                Every piece of this store is a widget that only takes props. Below they show recipes, tasks and events instead of products.
                Same components, different data. Source is in <code>frontend/storefront/src/widgets/</code>.
            </p>

            <ShowcaseBlock title="Card + CardGrid" note="Product cards in the store, recipe cards here." code={CODE_SAMPLES.card}>
                <CardGrid min={200}>
                    {RECIPES.map((recipe) => (
                        <Card
                            key={recipe.id}
                            image={recipe.img}
                            ratio="4/3"
                            title={recipe.name}
                            eyebrow={recipe.diet}
                            price={recipe.time + ' min'}
                            badges={<Badge tone={recipe.level === 'Easy' ? 'good' : 'warn'}>{recipe.level}</Badge>}
                        />
                    ))}
                </CardGrid>
            </ShowcaseBlock>

            <ShowcaseBlock
                title="FilterPanel"
                note="Filters are described as data, so the same panel works for any list."
                code={CODE_SAMPLES.filterPanel}
            >
                <div className="gal-split">
                    <FilterPanel
                        title="Recipe filters"
                        values={recipeFilters}
                        onChange={setRecipeFilters}
                        onClear={() => setRecipeFilters(EMPTY_RECIPE_FILTERS)}
                        fields={RECIPE_FILTER_FIELDS}
                    />
                    <div>
                        <p className="sub">{shownRecipes.length} recipes</p>
                        <div className="list">
                            {shownRecipes.map((recipe) => (
                                <ListRow
                                    key={recipe.id}
                                    image={recipe.img}
                                    title={recipe.name}
                                    meta={`${recipe.time} min · ${recipe.level}`}
                                    badges={<Badge>{recipe.diet}</Badge>}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </ShowcaseBlock>

            <ShowcaseBlock
                title="DataTable + Stat"
                note="A table with summary stats. Here it lists team tasks."
                code={CODE_SAMPLES.dataTable}
            >
                <StatRow>
                    <Stat label="Tasks" value={TASKS.length} />
                    <Stat label="Done" value={doneTaskCount} />
                    <Stat label="Open" value={TASKS.length - doneTaskCount} hint="Still to ship" />
                </StatRow>
                <DataTable rows={TASKS} columns={TASK_COLUMNS} />
            </ShowcaseBlock>

            <ShowcaseBlock title="Hero" note="Text on one side, photo on the other." code={CODE_SAMPLES.hero}>
                <Hero
                    title="Cook something new this weekend."
                    text="Fifteen recipes that need one pan and about half an hour."
                    image={unsplashUrl('1777499455310-80354aa1021f')}
                    action={{ label: 'Browse recipes', href: '#/widgets' }}
                />
            </ShowcaseBlock>

            <ShowcaseBlock title="Carousel + TileRow" note="Category tiles on the home page. Here, cuisines." code={CODE_SAMPLES.carousel}>
                <Carousel title="Cuisines">
                    <TileRow items={CUISINE_TILES} />
                </Carousel>
            </ShowcaseBlock>

            <ShowcaseBlock title="ListRow + Stepper" note="Cart and wishlist lines. Here, an event RSVP." code={CODE_SAMPLES.listRow}>
                <div className="list">
                    <ListRow
                        image={unsplashUrl('1773332585698-cba3c91b73e4')}
                        title="Pune AI meetup"
                        meta={
                            <>
                                <CalendarDays size={14} /> Saturday, 10:00 am
                            </>
                        }
                        badges={<Badge tone="good">12 seats left</Badge>}
                        right={
                            <>
                                <span className="sub">Seats</span>
                                <Stepper value={seats} max={6} onChange={setSeats} label="Seats" />
                            </>
                        }
                        actions={<button className="w-btn primary">RSVP</button>}
                    />
                </div>
            </ShowcaseBlock>

            <ShowcaseBlock title="NotificationList" note="A list of updates. Here, release notes." code={CODE_SAMPLES.notifications}>
                <div className="gal-notifs">
                    <NotificationList items={RELEASE_NOTES} />
                </div>
            </ShowcaseBlock>
        </section>
    )
}
