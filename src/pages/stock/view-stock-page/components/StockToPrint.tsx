import { Fragment } from "react";

export default function StockToPrint({ printRef, stocks }) {
  let locationMapping = {};
  for (const stock of stocks) {
    if (
      !stock.discontinued &&
      stock.name !== "Credit" &&
      !stock.name.startsWith("--")
    ) {
      if (!locationMapping.hasOwnProperty(stock.location_name)) {
        locationMapping[stock.location_name] = [];
      }
      locationMapping[stock.location_name].push(stock);
    }
  }

  return (
    <div ref={printRef} className="columns-2 gap-x-2 p-4 text-xs">
      {Object.keys(locationMapping)
        .sort()
        .map((coolerName) => (
          <Fragment key={`${coolerName}`}>
            <div className="text-sm font-bold">{coolerName}</div>
            {locationMapping[coolerName].map((stock) => (
              <div
                className="flex justify-between border-b-[1px] border-solid border-black py-[1px]"
                key={`${stock.name}`}
              >
                <div>{stock.name}</div>
                <div>{stock.stock.quantity}</div>
              </div>
            ))}
          </Fragment>
        ))}
    </div>
  );
}
