import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import BrandDetail from "./pages/BrandDetail";
import { ArticleDetail, News } from "./pages/News";
import Donate from "./pages/Donate";
import Assistant from "./pages/Assistant";
import Scan from "./pages/Scan";
import ProductDetail from "./pages/ProductDetail";
import { Community, CommunityDetail } from "./pages/Community";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import VolunteerPortal from "./pages/VolunteerPortal";
import { PrivacyPolicy, TermsOfUse } from "./pages/LegalPolicies";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/directory/:slug"} component={BrandDetail} />
      <Route path={"/products/:slug"} component={ProductDetail} />
      <Route path={"/directory"} component={Directory} />
      <Route path={"/news/:slug"} component={ArticleDetail} />
      <Route path={"/news"} component={News} />
      <Route path={"/donate"} component={Donate} />
      <Route path={"/assistant"} component={Assistant} />
      <Route path={"/scan"} component={Scan} />
      <Route path={"/community/:questionId"} component={CommunityDetail} />
      <Route path={"/community"} component={Community} />
      <Route path={"/about"} component={About} />
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/terms"} component={TermsOfUse} />
      <Route path={"/terms-of-use"} component={TermsOfUse} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/volunteer"} component={VolunteerPortal} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
