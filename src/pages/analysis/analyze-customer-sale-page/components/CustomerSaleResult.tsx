import { useState, useMemo } from "react";
import { BiExpandVertical, BiDownload, BiSortDown, BiSortUp } from "react-icons/bi";
import { convertTime } from "../../../../commons/utils/time.util";
import csvDownload from "json-to-csv-export";

export default function CustomerSaleResult({ data }) {
  const [customerSales, setCustomerSales] = useState(data.sort((a, b) => b.boxCount - a.boxCount));
  const [sortBy, setSortBy] = useState({
    type: "Box", 
    desc: true
  });
  const boxTotal = useMemo(() => {
    let sum = 0;
    for (const customerSale of data) {
      sum += customerSale.boxCount;
    }
    return sum.toFixed(0);
  }, [customerSales]);

  const onExportToCSV = () => {
    const csvFile = {
      filename: `${convertTime(new Date()).split("-").join("")}_analysis`,
      data: customerSales,
      headers: ["Customer", "Box Count", "Average Price"],
      delimiter: ",",
    }
    csvDownload(csvFile);
  }

  const onSort = (type: string) => {
    if (sortBy.type !== type) {
      setSortBy((prev) => ({
        ...prev,
        type: type,
        desc: true,
      }));
      const sorted = [...customerSales].sort((saleA, saleB) => {
        if (type === "Customer") {
          return saleA.customerName.localeCompare(saleB.customerName);
        } else if (type === "Box") {
          return saleB.boxCount - saleA.boxCount;
        } else if (type === "Price") {
          return saleB.avgPrice - saleA.avgPrice;
        }
      });
      setCustomerSales(sorted);
    } else {
      setSortBy((prev) => ({
        ...prev,
        desc: !prev.desc,
      }));
      setCustomerSales(customerSales.toReversed());
    }
  }

  const displaySortIcon = (type: string) => {
    if (sortBy.type !== type) {
      return <span><BiExpandVertical className="w-4 h-4"></BiExpandVertical></span>;
    } else if (sortBy.type === type && !sortBy.desc) {
      return <span><BiSortUp className="w-6 h-6 text-primary"></BiSortUp></span>;
    } else if (sortBy.type === type && sortBy.desc) {
      return <span><BiSortDown className="w-6 h-6 text-primary"></BiSortDown></span>;
    }
  }

  return (
    <>
      <div className="my-4 flex items-center justify-end gap-3">
        <div className="rounded-btn bg-warning p-2 text-sm font-semibold text-warning-content">
          {boxTotal} boxes
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
          <div className="md:w-6/12 custom-label flex gap-1 items-center cursor-pointer hover:text-primary">
            <span onClick={() => onSort("Customer")}>Customer</span>
            {displaySortIcon("Customer")}
          </div>
          <div className="md:w-5/12 custom-label flex gap-1 items-center cursor-pointer hover:text-primary">
            <span onClick={() => onSort("Box")}>Box</span>
            {displaySortIcon("Box")}
          </div>
          <div className="hidden md:w-1/12 custom-label md:flex gap-1 items-center cursor-pointer hover:text-primary">
            <span onClick={() => onSort("Price")}>Price</span>
            {displaySortIcon("Price")}
          </div>
        </div>
          {customerSales.map((customerSale) => (
            <div 
            key={customerSale.customerName} 
            className="flex justify-between w-full rounded-lg p-2 bg-base-200 dark:bg-base-300 my-2"
            >
              <div className="md:w-6/12">{customerSale.customerName}</div>
              <div className="md:w-5/12">{customerSale.boxCount}</div>
              <div className="hidden md:w-1/12 md:flex">${customerSale.avgPrice}</div>
            </div>
          ))}
      </div>
    </>
  );
}