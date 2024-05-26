import ProductSaleAnalysisForm from "./components/ProductSaleAnalysisForm";
import AnalysisPage from "../components/AnalysisPage";

export default function ProductSaleAnalysisPage() {
  return (
    <AnalysisPage
      renderForm={(onSubmit: (url: string) => void) => (
        <ProductSaleAnalysisForm onSubmit={onSubmit} />
      )}
    />
  );
}
