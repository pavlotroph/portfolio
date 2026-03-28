import { Suspense, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { startPortfolioMediaPreload } from "../../lib/portfolioMediaPreload";

export type LayoutCtx = {
  pageReady: boolean;
  setPageReady: (v: boolean) => void;
};

export const Layout: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isHomePage = pathname === "/" || pathname === "/home";

  // ✅ Only these pages should "wait" for data before showing Quote/Footer
  const shouldGateFooter = useMemo(() => {
    return pathname === "/work" || pathname === "/photo" || pathname === "/photography";
  }, [pathname]);


  // ✅ Default: ready on normal pages, not-ready on gated pages
  const [pageReady, setPageReady] = useState(!shouldGateFooter);

  // ✅ On route change, reset readiness appropriately
  useEffect(() => {
    setPageReady(!shouldGateFooter);
  }, [shouldGateFooter]);

  useEffect(() => {
    startPortfolioMediaPreload();
  }, []);

  return (
    <>
      <Header />
      <div style={{ paddingTop: "78px" }}>
        <main id="main-content">
          <Suspense>
            <Outlet
              key={pathname}
              context={{
                pageReady,
                setPageReady,
              }}
            />
          </Suspense>
        </main>
      </div>

      {!isHomePage && (
        <div
          style={{
            minHeight: 420,
            opacity: pageReady ? 1 : 0,
            transition: "opacity 250ms ease",
            pointerEvents: pageReady ? "auto" : "none",
          }}
        >
          {pageReady ? <Footer /> : null}
        </div>
      )}
    </>
  );
};
