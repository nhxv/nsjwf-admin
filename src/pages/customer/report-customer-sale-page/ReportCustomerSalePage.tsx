import { BiSearch, BiSortDown, BiSortUp } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import CustomerSaleList from "./components/CustomerSaleList";
import { useEffect, useState } from "react";
import SearchSaleModal from "./components/SearchSaleModal";
import { handleTokenExpire } from "../../../commons/utils/token.util";
import api from "../../../stores/api";
import {
  useSaleReducer,
  ACTION_TYPE,
} from "../../../commons/hooks/report-sale.hook";
import SaleDetailModal from "./components/SaleDetailModal";

export default function ReportCustomerSalePage() {
  const navigate = useNavigate();
  const [searchModal, setSearchModal] = useState({
    isOpen: false,
  });
  const [_modal, _setModal] = useState({
    isOpen: false,
  });
  const [stateReducer, dispatch] = useSaleReducer();
  const [focus, setFocus] = useState({
    report: null,
  });

  useEffect(() => {
    fetchData();

    // const reRender = setInterval(() => {
    //   dispatch({
    //     type: ACTION_TYPE.TRIGGER_RELOAD,
    //   });
    // }, 60000);
    // return () => {
    //   clearInterval(reRender);
    // };
  }, [stateReducer.reload]);

  const fetchData = () => {
    // This trigger a re-render on initial render cuz Object.is() detects this change, so yea.
    dispatch({
      type: ACTION_TYPE.LOADING,
    });

    const productPromise = api.get(`/products/all`);
    const customerPromise = api.get(`/customers/all`);
    const reportsPromise = api.get(stateReducer.reports_url);

    Promise.all([productPromise, customerPromise, reportsPromise])
      .then((res) => {
        const productRes = res[0];
        const customerRes = res[1];
        const reportRes = res[2];
        if (
          productRes?.data?.length !== 0 &&
          customerRes?.data?.length !== 0 &&
          reportRes?.data?.length !== 0
        ) {
          dispatch({
            type: ACTION_TYPE.SUCCESS,
            customers: customerRes.data,
            products: productRes.data,
            reports: reportRes.data,
            reports_url: stateReducer.reports_url,
          });
        } else if (
          productRes?.data?.length !== 0 &&
          customerRes?.data?.length !== 0
        ) {
          dispatch({
            type: ACTION_TYPE.SUCCESS,
            customers: customerRes.data,
            products: productRes.data,
          });
          dispatch({
            type: ACTION_TYPE.EMPTY,
          });
        } else {
          // Honestly if this happens we should just disable the search form but uhh later.
          dispatch({
            type: ACTION_TYPE.ERROR,
            error: "Error while fetching customers/products data.",
          });
        }
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );

        if (error.status === 401) {
          handleTokenExpire(navigate, dispatch, (msg) => ({
            type: ACTION_TYPE.ERROR,
            error: msg,
          }));
        } else {
          dispatch({
            type: ACTION_TYPE.ERROR,
            error: error.message,
          });
        }
      });
  };

  const onSearch = () => {
    setSearchModal((prev) => ({ ...prev, isOpen: true }));
  };

  const onCloseModal = () => {
    setSearchModal((prev) => ({ ...prev, isOpen: false }));
  };

  const onToggleSort = () => {
    dispatch({
      type: ACTION_TYPE.TOGGLE_SORT,
    });
  };

  const onSelectSale = (sale) => {
    setFocus({ report: sale });
    _setModal({ isOpen: true });
  };

  return (
    <section className="min-h-screen">
      <SaleDetailModal
        report={focus.report}
        isOpen={_modal.isOpen}
        onClose={() => {
          setSearchModal({ isOpen: false });
          setFocus({ report: null });
        }}
        dispatch={dispatch}
      />
      <SearchSaleModal
        isOpen={searchModal.isOpen}
        onClose={onCloseModal}
        stateReducer={stateReducer}
        dispatch={dispatch}
      />
      <div className="">
        <div className="fixed bottom-24 right-6 z-20 flex gap-2 md:right-8">
          <button className="btn-accent btn-circle btn" onClick={onToggleSort}>
            {stateReducer.oldest_first ? (
              <BiSortUp className="h-6 w-6"></BiSortUp>
            ) : (
              <BiSortDown className="h-6 w-6"></BiSortDown>
            )}
          </button>
          <button className="btn-accent btn-circle btn" onClick={onSearch}>
            <BiSearch className="h-6 w-6"></BiSearch>
          </button>
        </div>
        {/* <div className="w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12"> */}
        <div className="mx-4">
          <CustomerSaleList
            stateReducer={stateReducer}
            dispatch={dispatch}
            onSelectSale={onSelectSale}
          />
        </div>
      </div>
    </section>
  );
}
