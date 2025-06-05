import PageLayout from "./layouts/PageLayout";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "./themes/themes";
import { GlobalStyles } from "./themes/globalStyles";
import BLEProvider from "./contexts/BLEContext";
import { Route, Routes } from "react-router-dom";
import FruitPredictorPage from "./pages/experiments/fruit-predictor";
import PingPongerPage from "./pages/experiments/ping-ponger";
import CrawlerPage from "./pages/experiments/crawler";
import HomePage from "./pages/home";
import ImprintPage from "./pages/imprint";
import PrivacyPolicyPage from "./pages/privacy-policy";
import MaterialsPage from "./pages/materials";
import TroubleshootingPage from "./pages/troubleshooting";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

function App() {
  const { t, i18n } = useTranslation();
  return (
    <ThemeProvider theme={lightTheme}>
      <BLEProvider>
        <>
          <Helmet>
            {/* Set the lang attribute on the <html> tag dynamically */}
            <html lang={i18n.language} />
            <title>{t("seo_title")}</title>
            <meta name="description" content={t("seo_description")} />
          </Helmet>
          <GlobalStyles />
          <PageLayout>
            <Routes>
              {/* Define a route for each page */}
              <Route
                path="/experiments/fruit-predictor"
                element={<FruitPredictorPage />}
              />
              <Route
                path="/experiments/pitcher"
                element={<PingPongerPage />}
              />
              <Route path="/experiments/crawler" element={<CrawlerPage />} />

              <Route path="/imprint" element={<ImprintPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route
                path="/troubleshooting"
                element={<TroubleshootingPage />}
              />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </PageLayout>
        </>
      </BLEProvider>
    </ThemeProvider>
  );
}

export default App;
