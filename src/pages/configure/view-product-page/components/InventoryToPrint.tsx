import { Fragment } from "react";

export default function InventoryToPrint({ printRef, products }) {
  let locationMapping = {};
  for (const product of products) {
    if (
      !product.discontinued &&
      product.name !== "Credit" &&
      !product.name.startsWith("--")
    ) {
      if (!locationMapping.hasOwnProperty(product.location_name)) {
        locationMapping[product.location_name] = [];
      }
      locationMapping[product.location_name].push(product);
    }
  }

  return (
    <div ref={printRef} className="columns-2 gap-x-2 p-4 text-xs">
      {Object.keys(locationMapping)
        .sort()
        .map((coolerName) => (
          <Fragment key={`${coolerName}`}>
            <div className="text-sm font-bold">{coolerName}</div>
            {locationMapping[coolerName].map((product) => (
              <div
                className="border-b-[1px] border-solid border-black py-[1px]"
                key={`${product.name}`}
              >
                {product.name}
              </div>
            ))}
          </Fragment>
        ))}
    </div>
  );
}
