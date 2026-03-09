/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminPanel from './pages/AdminPanel';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Clients from './pages/Clients';
import CompletedTrips from './pages/CompletedTrips';
import Coupons from './pages/Coupons';
import CreatePayslip from './pages/CreatePayslip';
import DriverPortal from './pages/DriverPortal';
import Drivers from './pages/Drivers';
import FAQ from './pages/FAQ';
import Finance from './pages/Finance';
import FinancialReports from './pages/FinancialReports';
import Home from './pages/Home';
import MyBookings from './pages/MyBookings';
import Payslips from './pages/Payslips';
import Reservas from './pages/Reservas';
import RideTracking from './pages/RideTracking';
import Settings from './pages/Settings';
import Taximeter from './pages/Taximeter';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminPanel": AdminPanel,
    "Analytics": Analytics,
    "Calendar": Calendar,
    "Clients": Clients,
    "CompletedTrips": CompletedTrips,
    "Coupons": Coupons,
    "CreatePayslip": CreatePayslip,
    "DriverPortal": DriverPortal,
    "Drivers": Drivers,
    "FAQ": FAQ,
    "Finance": Finance,
    "FinancialReports": FinancialReports,
    "Home": Home,
    "MyBookings": MyBookings,
    "Payslips": Payslips,
    "Reservas": Reservas,
    "RideTracking": RideTracking,
    "Settings": Settings,
    "Taximeter": Taximeter,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};