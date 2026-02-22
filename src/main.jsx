import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { seedDatabase } from '@/db-seed'

seedDatabase().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  )
})
