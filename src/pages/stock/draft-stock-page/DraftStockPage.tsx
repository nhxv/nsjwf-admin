import StockFormContainer from "./components/StockFormContainer";

export default function DraftStockPage() {
  return (
    <section className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-11/12 md:w-10/12 lg:w-6/12">
          <StockFormContainer></StockFormContainer>
        </div>
      </div>
    </section>
  );
}
