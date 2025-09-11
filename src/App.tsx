import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import AboutUs from './pages/AboutUs/AboutUs';
import CollectionPage from './pages/CollectionPage/CollectionPage';
import Contact from './pages/Contact/Contact';
import Home from './pages/HomePage/HomePage';
import Info from './pages/Info/Info';
import Photo from './pages/Photo/Photo';
import Work from './pages/Work/Work';

const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => window.scrollTo(0, 0), []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: '100%', top: 0 }}
    >
      {children}
    </motion.div>
  );
};

export const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  useEffect(() => window.scrollTo(0, 0), [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Layout />
            </motion.div>
          }
        >
          <Route
            index
            element={
              <AnimatedPage>
                <Home />
              </AnimatedPage>
            }
          />
          <Route
            path="home"
            element={
              <AnimatedPage>
                <Home />
              </AnimatedPage>
            }
          />

          {/** Work listing и деталка */}
          <Route
            path="work"
            element={
              <AnimatedPage>
                <Work />
              </AnimatedPage>
            }
          />
          <Route
            path="work/:id"
            element={
              <AnimatedPage>
                <CollectionPage source="work" />
              </AnimatedPage>
            }
          />

          {/** Photography listing и деталка */}
          <Route
            path="photography"
            element={
              <AnimatedPage>
                <Photo />
              </AnimatedPage>
            }
          />
          <Route
            path="photography/:id"
            element={
              <AnimatedPage>
                <CollectionPage source="photo" />
              </AnimatedPage>
            }
          />

          <Route
            path="info"
            element={
              <AnimatedPage>
                <Info />
              </AnimatedPage>
            }
          />
          <Route
            path="contact"
            element={
              <AnimatedPage>
                <Contact />
              </AnimatedPage>
            }
          />
          <Route
            path="about"
            element={
              <AnimatedPage>
                <AboutUs />
              </AnimatedPage>
            }
          />

          {/** Убираем /collections/:id */}
          <Route
            path="*"
            element={
              <AnimatedPage>
                <Home />
              </AnimatedPage>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};
