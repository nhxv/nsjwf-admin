import { BiSearch, BiSortDown, BiSortUp } from "react-icons/bi";
import CustomerSaleList from "./components/CustomerSaleList";
import { useState } from "react";
import SearchSaleModal from "./components/SearchSaleModal";
import api from "../../../stores/api";
import SaleDetailModal from "./components/SaleDetailModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { convertTime } from "../../../commons/utils/time.util";

export default function ReportCustomerSalePage() {
  const [searchModal, setSearchModal] = useState({
    isOpen: false,
  });
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
  });
  const [queryURL, setQueryURL] = useState(
    `/customer-orders/sold/search?date=${convertTime(new Date())}`
  );
  const [focus, setFocus] = useState({ report: null });
  const [latestFirst, setLatestFirst] = useState(true);

  const customerQuery = useQuery({
    queryKey: ["reports", "customers"],
    queryFn: async () => {
      const result = await api.get(`/customers/all`);
      return result.data;
    },
  });

  const reportQuery = useQuery({
    // Allow queryFn to trigger when queryURL changes.
    queryKey: ["reports", `reports=${queryURL}`],
    queryFn: async () => {
      const result = await api.get(queryURL);

      return result.data;
    },
  });

  const onSearch = () => {
    setSearchModal((prev) => ({ ...prev, isOpen: true }));
  };

  const onToggleSort = () => {
    setLatestFirst(!latestFirst);
  };

  const onSelectSale = (sale) => {
    setFocus({ report: sale });
    setDetailModal({ isOpen: true });
  };

  const onSearchSubmit = (url: string) => {
    setQueryURL(`/customer-orders/sold/search?${url}`);
  };

  const reports = reportQuery?.data
    ? latestFirst
      ? reportQuery.data
      : reportQuery.data.toReversed()
    : [];

  return (
    <section className="min-h-screen">
      <SaleDetailModal
        report={focus.report}
        isOpen={detailModal.isOpen}
        onClose={() => {
          setSearchModal((prev) => ({ ...prev, isOpen: false }));
          setFocus({ report: null });
        }}
      />
      <SearchSaleModal
        isOpen={searchModal.isOpen}
        customers={customerQuery?.data ? customerQuery.data : []}
        onClose={() => {
          setSearchModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onSearchSubmit={onSearchSubmit}
      />
      <div className="">
        <div className="fixed bottom-24 right-6 z-20 flex gap-2 md:right-8">
          <button className="btn btn-circle btn-accent" onClick={onToggleSort}>
            {latestFirst ? (
              <BiSortDown className="h-6 w-6"></BiSortDown>
            ) : (
              <BiSortUp className="h-6 w-6"></BiSortUp>
            )}
          </button>
          <button className="btn btn-circle btn-accent" onClick={onSearch}>
            <BiSearch className="h-6 w-6"></BiSearch>
          </button>
        </div>
        <div className="mx-4">
          <CustomerSaleList
            reports={reports}
            reportQuery={reportQuery}
            onSelectSale={onSelectSale}
          />
        </div>
      </div>
    </section>
  );
}
