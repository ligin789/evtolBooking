import { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { Loader } from './components/experience/Loader';
import { TopBar } from './components/experience/TopBar';
import { WebGLFallback } from './components/experience/WebGLFallback';
import { hasWebGL } from './lib/webgl';
import ExperiencePage from './pages/ExperiencePage';
import { useExperience } from './store/experienceStore';
import { useEffect } from 'react';

const EVTOLScene = lazy(() => import('./three/EVTOLScene'));
const PassengersPage = lazy(() => import('./pages/PassengersPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

/** Persistent shell: the 3D scene lives here so it survives route changes. */
function Shell() {
  const webgl = useMemo(hasWebGL, []);
  useEffect(() => {
    if (!webgl) {
      const s = useExperience.getState();
      s.setSceneReady(true);
      if (s.stage === 'intro') s.setStage('hero');
    }
  }, [webgl]);

  return (
    <div className="relative min-h-full">
      <div className="fixed inset-0 z-0">
        {webgl ? (
          <Suspense fallback={null}>
            <EVTOLScene />
          </Suspense>
        ) : (
          <WebGLFallback />
        )}
      </div>
      <TopBar />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      <Loader />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<ExperiencePage />} />
          <Route path="passengers" element={<PassengersPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="confirmation" element={<ConfirmationPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
