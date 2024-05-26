import AnalyzeProductSaleForm from "./components/AnalyzeProductSaleForm";
import AnalysisPage from "../components/AnalysisPage";

export default function AnalyzeProductSalePage() {
  return (
    <AnalysisPage
      renderForm={(onSubmit: (url: string) => void) => (
        <AnalyzeProductSaleForm onSubmit={onSubmit} />
      )}
    />
  );
}
