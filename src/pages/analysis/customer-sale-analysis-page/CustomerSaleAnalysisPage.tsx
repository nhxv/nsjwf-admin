import CustomerSaleAnalysisForm from "./components/CustomerSaleAnalysisForm";
import AnalysisPage from "../components/AnalysisPage";

export default function CustomerSaleAnalysisPage() {
  return (
    <AnalysisPage
      renderForm={(onSubmit: (url: string) => void) => (
        <CustomerSaleAnalysisForm onSubmit={onSubmit} />
      )}
    />
  );
}
