import StockList from "./components/StockList";

export default function ViewStockPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">View stock</h1>
      <StockList></StockList>
    </section>
  );
}
