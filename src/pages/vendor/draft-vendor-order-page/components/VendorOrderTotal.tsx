import { Control, useWatch } from "react-hook-form";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";

interface IVendorOrderTotalProps {
  control: Control<any>;
}

// Watches the whole `products` array to compute the running total, so it
// re-renders on every keystroke in any row - but it's a cheap leaf, so this
// keeps that churn from cascading into the (potentially large) row list.
export default function VendorOrderTotal({ control }: IVendorOrderTotalProps) {
  const products = useWatch({ control, name: "products" }) ?? [];
  const total =
    products.length > 0
      ? niceVisualDecimal(
          +products.reduce(
            (prev, current) => prev + current.quantity * +current.price,
            0
          )
        )
      : "0";

  return (
    <div className="mb-4 flex items-center">
      Total:
      <span className="mx-1 text-xl font-medium">${total}</span>
      <span>
        {`(${products.length} ${products.length > 1 ? "items" : "item"})`}
      </span>
    </div>
  );
}
