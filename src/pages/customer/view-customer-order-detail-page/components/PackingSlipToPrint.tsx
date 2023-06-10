import { convertTimeToText } from "../../../../commons/utils/time.util";

const MAX_LINES_PER_PAGE: number = 18;

export default function PackingSlipToPrint({ printRef, order }) {
  const columnNumber = order.productCustomerOrders.length <= MAX_LINES_PER_PAGE ? 1 : 2;
  // TODO: Figure out why it always print an empty page at the end.
  return (
    <div ref={printRef}>
      {SplitProductsIntoPages(order, columnNumber).map((packingSlipPage, i) => {
        return (
          <div className="break-after-page px-4 py-4" key={i}>
            {packingSlipPage}
          </div>
        )
      })}
    </div>
  )
}

// Technically can handle more columns but format already breaks on 3 columns.
function SplitProductsIntoPages(order, columnCount: number = 2) {
  let pages = [];
  for (let i = 0; i < order.productCustomerOrders.length; i += MAX_LINES_PER_PAGE * columnCount) {
    pages.push((
        <div className="flex flex-col">
          {/* Headers */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="block font-serif text-[0.625rem]">
                  New San Jose Wholesale Foods, Inc.
                </h1>
                <p className="block text-[0.5rem]">
                  1005 S. 5th St, San Jose, CA 95112
                </p>
                <p className="block text-[0.5rem]">
                  Mailing Address: P.O. Box 730967, San Jose, CA 95173 - 0967
                </p>
                <p className="block text-[0.5rem]">
                  Tel: (408) 279-3888 • (408) 279-3889 • (408) 279-0413 • Fax:
                  (408) 279-3890
                </p>
              </div>
              <div>
                <p className="text-xs">
                  Invoice No.:{" "}
                  <span className="font-semibold">
                    {order.manual_code ? order.manual_code : order.code}
                  </span>
                </p>
                <p className="text-xs">
                  Ship at:{" "}
                  <span className="font-semibold">
                    {convertTimeToText(new Date(order.expected_at))}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-4 ">
            <div className="block text-xl">Packing Slip</div>
            <div className="block text-2xl font-bold">{order.customer_name}</div>
            <div className="block">{order.note}</div>
          </div>

          {/* Column Headers + Products List */}
          <div className={`grid grid-cols-${columnCount} gap-x-3`}>
            {/*https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#using_arrow_functions_and_array.from
            All of this just to render this header columnCount times. Incredible.*/}
            {Array.from({ length: columnCount }, (_, i) => i).map((_) => (
              <div className="flex w-full border-b-4 border-black pb-1">
                <div className="w-[64px] text-sm font-semibold">Qty</div>
                <div className="ml-8 text-sm font-semibold">Item Description</div>
              </div>
            ))}
            
            {order.productCustomerOrders.slice(i, i + MAX_LINES_PER_PAGE * columnCount).map((productOrder) => (
              <div
                key={productOrder.unit_code}
                className="flex w-full border-b border-black py-2"
              >
                <div className="w-[64px] font-semibold">
                  {productOrder.quantity}{" "}
                  {productOrder.unit_code.split("_")[1].toLowerCase() === "box"
                    ? ``
                    : `(${productOrder.unit_code.split("_")[1].toLowerCase()})`}
                </div>
                <div className="ml-8">{productOrder.product_name}</div>
              </div>
            ))}
          </div>
        </div>
    ))
  }
  return pages;
}
