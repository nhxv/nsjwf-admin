import AnalyzeCustomerSaleForm from "./components/AnalyzeCustomerSaleForm";
import AnalysisContainer from "../components/AnalysisContainer";

export default function AnalyzeCustomerSalePage() {
  return (
    <AnalysisContainer
      renderForm={(onSubmit: (url: string) => void) => (
        <AnalyzeCustomerSaleForm onSubmit={onSubmit} />
      )}
    />
  );
}
