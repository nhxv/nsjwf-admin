import csvDownload from "json-to-csv-export";
import { useMemo, useState } from "react";
import {
  BiDownload,
  BiExpandVertical,
  BiSortDown,
  BiSortUp,
} from "react-icons/bi";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";

export default function ProductSaleResult({ data }) {
  const [productSales, setProductSales] = useState(
    data.sort((a, b) => b.boxCount - a.boxCount)
  );

  const [sortBy, setSortBy] = useState({
    type: "Box",
    desc: true,
  });

  const [priceTotal, boxTotal] = useMemo(() => {
    let boxSum = 0;
    let priceSum = 0;
    for (const productSale of data) {
      boxSum += productSale.boxCount;
      priceSum += productSale.boxCount * productSale.avgPrice;
    }
    return [niceVisualDecimal(priceSum), boxSum.toFixed(0)];
  }, [productSales]);

  const onExportToCSV = () => {
    const csvFile = {
      filename: `${convertTime(new Date()).split("-").join("")}_analysis`,
      data: productSales,
      headers: ["Product", "Box Count", "Average Price"],
      delimiter: ",",
    };
    csvDownload(csvFile);
  };

  const onSort = (type: string) => {
    if (sortBy.type !== type) {
      setSortBy((prev) => ({
        ...prev,
        type: type,
        desc: true,
      }));
      const sorted = [...productSales].sort((saleA, saleB) => {
        if (type === "Product") {
          return saleA.productName.localeCompare(saleB.productName);
        } else if (type === "Box") {
          return saleB.boxCount - saleA.boxCount;
        } else if (type === "Price") {
          return saleB.avgPrice - saleA.avgPrice;
        }
      });
      setProductSales(sorted);
    } else {
      setSortBy((prev) => ({
        ...prev,
        desc: !prev.desc,
      }));
      setProductSales(productSales.toReversed());
    }
  };

  const displaySortIcon = (type: string) => {
    if (sortBy.type !== type) {
      return (
        <span>
          <BiExpandVertical className="h-4 w-4"></BiExpandVertical>
        </span>
      );
    } else if (sortBy.type === type && !sortBy.desc) {
      return (
        <span>
          <BiSortUp className="h-6 w-6 text-primary"></BiSortUp>
        </span>
      );
    } else if (sortBy.type === type && sortBy.desc) {
      return (
        <span>
          <BiSortDown className="h-6 w-6 text-primary"></BiSortDown>
        </span>
      );
    }
  };

  if (productSales?.length === 0) {
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-8/12">
        <Alert type="empty" message={"Such empty, much hollow..."}></Alert>
      </div>
    );
  }

  return (
    <>
      <div className="my-4 flex items-center justify-end gap-3">
        <div className="rounded-btn bg-info p-2 text-sm font-semibold text-info-content">
          {boxTotal} boxes
        </div>
        <div className="rounded-btn hidden bg-info p-2 text-sm font-semibold text-info-content md:block">
          ${priceTotal} in total
        </div>
        <button
          className="rounded-btn flex bg-accent p-2 text-sm font-semibold"
          onClick={onExportToCSV}
        >
          <span className="mr-2">Download CSV</span>
          <BiDownload className="h-5 w-5"></BiDownload>
        </button>
      </div>
      <div className="custom-card w-full">
        <div className="flex justify-between gap-3">
          <div className="custom-label flex cursor-pointer items-center gap-1 hover:text-primary md:w-6/12">
            <span onClick={() => onSort("Product")}>Product</span>
            {displaySortIcon("Product")}
          </div>
          <div className="custom-label flex cursor-pointer items-center gap-1 hover:text-primary md:w-5/12">
            <span onClick={() => onSort("Box")}>Box</span>
            {displaySortIcon("Box")}
          </div>
          <div className="custom-label hidden cursor-pointer items-center gap-1 hover:text-primary md:flex md:w-1/12">
            <span onClick={() => onSort("Price")}>Price</span>
            {displaySortIcon("Price")}
          </div>
        </div>
        {productSales.map((productSale) => (
          <div
            key={productSale.productName}
            className="my-2 flex w-full justify-between rounded-lg bg-base-200 p-3 dark:bg-base-300"
          >
            <div className="md:w-6/12">{productSale.productName}</div>
            <div className="md:w-5/12">{productSale.boxCount}</div>
            <div className="hidden md:flex md:w-1/12">
              ${productSale.avgPrice}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
