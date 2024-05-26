import AnalyzeCustomerSaleForm from "./components/AnalyzeCustomerSaleForm";
import AnalysisPage from "../components/AnalysisPage";

export default function AnalyzeCustomerSalePage() {
  return (
    <AnalysisPage
      renderForm={(onSubmit: (url: string) => void) => (
        <AnalyzeCustomerSaleForm onSubmit={onSubmit} />
      )}
    />
  );
}
