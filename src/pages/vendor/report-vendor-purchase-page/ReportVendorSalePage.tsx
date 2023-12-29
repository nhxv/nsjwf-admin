import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BiSearch, BiSortDown, BiSortUp } from "react-icons/bi";
import { convertTime } from "../../../commons/utils/time.util";
import api from "../../../stores/api";
import VendorSaleList from "./components/VendorSaleList";
import SaleDetailModal from "./components/SaleDetailModal";
import SearchSaleModal from "./components/SearchSaleModal";

export default function ReportVendorSalePage() {
  const [searchModal, setSearchModal] = useState({
    isOpen: false,
  });
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
  });
  const [queryURL, setQueryURL] = useState(
    `/vendor-orders/sold/search?start_date=${convertTime(
      new Date()
    )}&end_date=${convertTime(new Date())}`
  );
  const [focus, setFocus] = useState({ report: null });
  const [latestFirst, setLatestFirst] = useState(true);

  const vendorQuery = useQuery({
    queryKey: ["reports", "vendors"],
    queryFn: async () => {
      const result = await api.get(`/vendors/all`);
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
    setQueryURL(`/vendor-orders/sold/search?${url}`);
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
        vendors={vendorQuery?.data ? vendorQuery.data : []}
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
          <VendorSaleList
            reports={reports}
            reportQuery={reportQuery}
            onSelectSale={onSelectSale}
          />
        </div>
      </div>
    </section>
  );
}
