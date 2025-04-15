import { convertTimeToText } from "../../../../commons/utils/time.util";

const MAX_LINES_PER_PAGE: number = 18;

export default function PackingSlipToPrint({ printRef, order }) {
  const columnNumber =
    order.productCustomerOrders.length <= MAX_LINES_PER_PAGE ? 1 : 2;
  const renderPages = [];
  for (const [key, packingSlipPage] of SplitProductsIntoPages(
    order,
    columnNumber,
  ).entries()) {
    renderPages.push(
      <div className="break-after-page px-4 py-4" key={key}>
        {packingSlipPage}
      </div>,
    );
  }

  return <div ref={printRef}>{renderPages}</div>;
}

function SplitProductsIntoPages(order, columnCount: number = 2) {
  columnCount = Math.max(1, Math.min(2, columnCount));
  // https://tailwindcss.com/docs/content-configuration#dynamic-class-names
  let columnStyling = `grid ${columnCount === 1 ? "" : "grid-cols-2"} gap-x-4`;

  let pages = new Map();
  for (
    let i = 0;
    i < order.productCustomerOrders.length;
    i += MAX_LINES_PER_PAGE * columnCount
  ) {
    // Sort by Cooler.
    const productCustomerOrders = [...order.productCustomerOrders].sort(
      (productOrderA, productOrderB) => {
        const locationA = productOrderA.product.location_name;
        const locationB = productOrderB.product.location_name;
        return locationA.localeCompare(locationB);
      },
    );
    pages.set(
      // Key
      `${order.productCustomerOrders[i].product_name}-${order.productCustomerOrders[i].unit_code}`,
      // Value
      <div className="flex flex-col">
        {/* Headers */}
        <div className="mb-2">
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
        <div className="">
          <div className="block text-xl">Packing Slip</div>
          <div className="block text-2xl font-bold">{order.customer_name}</div>
          <div className="block">{order.note}</div>
        </div>

        {/* Column Headers. We need to separate so the line in between columns doesn't intersect with the header. */}
        <div className="flex basis-0 gap-x-3">
          {/*https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#using_arrow_functions_and_array.from
            All of this just to render this header columnCount times. Incredible.*/}
          {Array.from({ length: columnCount }, (_, i) => i).map((ind) => (
            <div
              className="flex w-full justify-between border-b-4 border-black pb-1"
              key={`${ind}`}
            >
              <div className="flex">
                <div className="w-[64px] text-sm font-semibold">Qty</div>
                <div className="ml-8 text-sm font-semibold">
                  Item Description
                </div>
              </div>
              <div className="text-sm font-semibold">Location</div>
            </div>
          ))}
        </div>

        {/* Products List */}
        <div className={columnStyling}>
          {/* Fill out the first column, then the 2nd column */}
          <div>
            {productCustomerOrders
              .slice(i, i + MAX_LINES_PER_PAGE)
              .map((productOrder) => (
                <div
                  key={`${order.code}-${productOrder.product_name}-${productOrder.unit_code}`}
                  className="flex w-full justify-between border-b border-black py-2"
                >
                  <div className="flex">
                    <div className="w-[64px] font-semibold">
                      {productOrder.quantity}{" "}
                      {productOrder.unit_code.split("_")[1].toLowerCase() ===
                      "box"
                        ? ``
                        : `(${productOrder.unit_code
                            .split("_")[1]
                            .toLowerCase()})`}
                    </div>
                    <div className="ml-8">{productOrder.product_name}</div>
                  </div>
                  <div className="">{productOrder.product.location_name}</div>
                </div>
              ))}
          </div>
          {/* 2nd column */}
          <div>
            {productCustomerOrders
              .slice(
                i + MAX_LINES_PER_PAGE,
                i + MAX_LINES_PER_PAGE * columnCount,
              )
              .map((productOrder) => (
                <div
                  key={`${order.code}-${productOrder.product_name}-${productOrder.unit_code}`}
                  className="flex w-full justify-between border-b border-black py-2"
                >
                  <div className="flex">
                    <div className="w-[64px] font-semibold">
                      {productOrder.quantity}{" "}
                      {productOrder.unit_code.split("_")[1].toLowerCase() ===
                      "box"
                        ? ``
                        : `(${productOrder.unit_code
                            .split("_")[1]
                            .toLowerCase()})`}
                    </div>
                    <div className="ml-8">{productOrder.product_name}</div>
                  </div>
                  <div className="">{productOrder.product.location_name}</div>
                </div>
              ))}
          </div>
        </div>
      </div>,
    );
  }
  return pages;
}
