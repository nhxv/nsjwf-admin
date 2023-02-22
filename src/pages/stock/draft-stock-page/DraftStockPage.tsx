import StockFormContainer from "./components/StockFormContainer";

export default function DraftStockPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Change stock</h1>
      <div className="flex justify-center">
        <div className="w-11/12 md:w-10/12 lg:w-6/12">
          <StockFormContainer></StockFormContainer>
        </div>
      </div>
    </section>
  );
}
