import Birthdays from './pages/Birthdays';
import Campaigns from './pages/Campaigns';
import CatalogScan from './pages/CatalogScan';
import Catalogo from './pages/Catalogo';
import ConsumoMercadoria from './pages/ConsumoMercadoria';
import CustomerDetails from './pages/CustomerDetails';
import Customers from './pages/Customers';
import Dashboard from './pages/DashboardSupabase';
import DespesaMensalForm from './pages/DespesaMensalForm';
import DespesasMensais from './pages/DespesasMensais';
import EntradaMercadoria from './pages/EntradaMercadoria';
import Installments from './pages/Installments';
import MercadoriaDetails from './pages/MercadoriaDetails';
import MercadoriaForm from './pages/MercadoriaForm';
import Mercadorias from './pages/Mercadorias';
import NewSale from './pages/NewSale';
import PresenteBuilder from './pages/PresenteBuilder';
import Presentes from './pages/Presentes';
import ProductDetails from './pages/ProductDetails';
import Products from './pages/Products';
import Reports from './pages/Reports';
import SaleDetails from './pages/SaleDetails';
import Sales from './pages/Sales';
import StockEntry from './pages/StockEntry';
import Vouchers from './pages/Vouchers';
import VoucherView from './pages/VoucherView';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Birthdays": Birthdays,
    "Campaigns": Campaigns,
    "CatalogScan": CatalogScan,
    "Catalogo": Catalogo,
    "ConsumoMercadoria": ConsumoMercadoria,
    "CustomerDetails": CustomerDetails,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "DespesaMensalForm": DespesaMensalForm,
    "DespesasMensais": DespesasMensais,
    "EntradaMercadoria": EntradaMercadoria,
    "Installments": Installments,
    "MercadoriaDetails": MercadoriaDetails,
    "MercadoriaForm": MercadoriaForm,
    "Mercadorias": Mercadorias,
    "NewSale": NewSale,
    "PresenteBuilder": PresenteBuilder,
    "Presentes": Presentes,
    "ProductDetails": ProductDetails,
    "Products": Products,
    "Reports": Reports,
    "SaleDetails": SaleDetails,
    "Sales": Sales,
    "StockEntry": StockEntry,
    "Vouchers": Vouchers,
    "VoucherView": VoucherView,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};