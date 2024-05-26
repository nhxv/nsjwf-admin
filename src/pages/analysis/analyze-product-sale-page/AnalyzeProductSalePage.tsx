import AnalyzeProductSaleForm from "./components/AnalyzeProductSaleForm";
import AnalysisContainer from "../components/AnalysisContainer";

export default function AnalyzeProductSalePage() {
  return (
    <AnalysisContainer
      renderForm={(onSubmit: (url: string) => void) => (
        <AnalyzeProductSaleForm onSubmit={onSubmit} />
      )}
    />
  );
}
