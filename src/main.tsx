import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Index from './pages';
import NotFound from './pages/404';
import ReactGA from 'react-ga4';
import {
  GOOGLE_ANALYTICS_TRACKING_ID,
  USE_GOOGLE_ANALYTICS,
} from './utils/const';
import '@/styles/index.css';
import { withOptionalGAPageTracking } from './utils/trackRoute';

const HomePage = lazy(() => import('./pages/total'));

const routeFallback = (
  <div className="min-h-screen bg-[#050505] px-6 py-24 text-white">
    <div className="mx-auto max-w-6xl section-shell">
      <div className="section-shell__header">
        <span className="section-shell__eyebrow">Loading</span>
        <h1 className="section-shell__title">Preparing route</h1>
      </div>
      <p className="text-base leading-7 text-white/58">
        页面资源正在按需加载，马上就好。
      </p>
    </div>
  </div>
);

if (USE_GOOGLE_ANALYTICS) {
  ReactGA.initialize(GOOGLE_ANALYTICS_TRACKING_ID);
}

const routes = createBrowserRouter(
  [
    {
      path: '/',
      element: withOptionalGAPageTracking(<Index />),
    },
    {
      path: 'summary',
      element: withOptionalGAPageTracking(
        <Suspense fallback={routeFallback}>
          <HomePage />
        </Suspense>
      ),
    },
    {
      path: '*',
      element: withOptionalGAPageTracking(<NotFound />),
    },
  ],
  { basename: import.meta.env.BASE_URL }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={routes} />
    </HelmetProvider>
  </React.StrictMode>
);
