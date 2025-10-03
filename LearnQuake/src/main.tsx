import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

// pages
import InfoHub from './Pages/InfoHub'
import Simulation from './Pages/Simulation'
import Seismology from './Pages/Seismology'
import About from './Pages/About'
import NotFound from './Pages/NotFound'
import Footage from './Pages/Footage'

/*
  ROUTING GUIDE:
  1. Create a new page component in src/Pages (e.g., About.tsx exporting a React component).
  2. Import it above (see the About example import).
  3. Add a new route object inside the array below, e.g.:
       { path: '/about', element: <About /> },
  4. Navigate by typing the path in the browser or by using <Link to="/about">About</Link>.

  kapag needed ng nav and footer eto mas maganda gawin : 

  5. If later need shared layout (nav, footer), change this to:
       const router = createBrowserRouter([
         { path: '/', element: <Layout />, children: [
             { index: true, element: <InfoHub /> },
             { path: 'about', element: <About /> },
         ]},
       ])
     and create a Layout component that renders <Outlet />.
*/

const router = createBrowserRouter([
  { path: '/', element: <InfoHub /> },
  { path: '/simulation', element: <Simulation /> },
  { path: '/seismology', element: <Seismology /> },
  { path: '/about', element: <About /> },
  { path: '*', element: <NotFound /> },
  { path: '/footage', element: <Footage /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)