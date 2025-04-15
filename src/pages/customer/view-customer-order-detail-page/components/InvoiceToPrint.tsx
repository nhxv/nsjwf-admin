import { Fragment } from "react";
import { convertTimeToText } from "../../../../commons/utils/time.util";

const toForceFixedDecimal = (n: number | string, fix: number = 2) => {
  // Return a rounded decimal to the 2nd place with comma separated.

  // If we use toFixed() and toLocaleString() directly, the latter
  // will remove the 0 in the .50, which is kinda ugly?
  // So we only do the locale on the whole part of the decimal.
  const rounded = Number(n).toFixed(fix);
  let [whole, decimal] = rounded.split(".");
  whole = Number(whole).toLocaleString();

  return `${whole}.${decimal}`;
};

export default function InvoiceToPrint({ printRef, order }) {
  return (
    <div
      className="flex h-[11in] flex-col gap-1 p-4 text-primary"
      ref={printRef}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="self-baseline">
          <h1 className="block font-serif text-lg text-red-500">
            New San Jose Wholesale Foods, Inc.
          </h1>
          <p className="block text-xs">1005 S. 5th St, San Jose, CA 95112</p>
          <p className="block text-xs">
            Mailing Address: P.O. Box 730967, San Jose, CA 95173 - 0967
          </p>
          <p className="block text-xs">
            Tel: (408) 279-3888 • (408) 279-3889 • (408) 279-0413 • Fax: (408)
            279-3890
          </p>
        </div>
        <div className="self-baseline text-right">
          <p className="text-xs">
            Invoice No.:{" "}
            <span className="font-semibold text-red-500">
              {order.manual_code ? order.manual_code : order.code}
            </span>
          </p>
          <p className="text-xs">
            Delivered on:{" "}
            <span className="font-semibold">
              {convertTimeToText(new Date(order.expected_at))}
            </span>
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="">
        <div className="block text-xl">Invoice</div>
        <div className="block text-2xl font-bold text-black">
          {order.customer_name}
        </div>
      </div>

      {/* Products List */}
      <div className="grid grid-cols-12 text-sm">
        <div className="col-span-6 border-b-2 border-primary text-lg font-bold">
          Product
        </div>
        <div className="col-span-2 border-b-2 border-primary text-right text-lg font-bold">
          Quantity
        </div>
        <div className="col-span-2 border-b-2 border-primary text-right text-lg font-bold">
          Unit Price
        </div>
        <div className="col-span-2 border-b-2 border-primary text-right text-lg font-bold">
          Amount
        </div>
        {order.productCustomerOrders.map((productOrder) => (
          <Fragment
            key={`${order.code}-${productOrder.product_name}-${productOrder.unit_code}`}
          >
            <div className="col-span-6 border-b-[1px] border-solid px-2">
              {productOrder.product_name}
            </div>
            <div className="col-span-2 border-b-[1px] border-solid text-right text-black">
              {`${productOrder.quantity} ${
                productOrder.unit_code.split("_")[1].toLowerCase() === "box"
                  ? ``
                  : `(${productOrder.unit_code.split("_")[1].toLowerCase()})`
              }`}
            </div>
            <div className="col-span-2 border-b-[1px] border-solid text-right text-black">
              {productOrder.unit_price}
            </div>
            <div className="col-span-2 border-b-[1px] border-solid text-right text-black">
              {!productOrder.unit_price
                ? ""
                : `$${toForceFixedDecimal(
                    parseFloat(
                      (
                        productOrder.quantity * productOrder.unit_price
                      ).toString()
                    )
                  )}`}
            </div>
          </Fragment>
        ))}
      </div>

      {/* Summary */}
      <div className="flex h-full flex-col justify-end">
        <div className="flex justify-between">
          <div className="text-xl">Customer Signature:</div>
          <div className="text-right text-xl">
            Total:{" "}
            <span className="font-bold text-black">
              $
              {toForceFixedDecimal(
                order.productCustomerOrders.reduce((total, productOrder) => {
                  if (!productOrder.unit_price) return total;
                  return (
                    total + productOrder.quantity * productOrder.unit_price
                  );
                }, 0)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
