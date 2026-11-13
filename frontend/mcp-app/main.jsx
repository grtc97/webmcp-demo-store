import { createRoot } from 'react-dom/client'

import '@storefront/widgets/widgets.css'
import '@storefront/styles/store.css'

import App from './App'
import './styles/app.css'

createRoot(document.getElementById('root')).render(<App />)
