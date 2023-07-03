import { BiSearch } from "react-icons/bi";
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

export default function ReportCustomerSalePage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState({
    isOpen: false,
  });
  const [stateReducer, dispatch] = useSaleReducer();

  useEffect(() => {
    fetchData();

    const reRender = setInterval(() => {
      dispatch({
        type: ACTION_TYPE.TRIGGER_RELOAD,
      });
    }, 60000);
    return () => {
      clearInterval(reRender);
    };
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
          handleTokenExpire(navigate, dispatch, (_, msg) => ({
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
    setModal((prev) => ({ ...prev, isOpen: true }));
  };

  const onCloseModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };
  return (
    <section className="min-h-screen">
      <SearchSaleModal
        isOpen={modal.isOpen}
        onClose={onCloseModal}
        stateReducer={stateReducer}
        dispatch={dispatch}
      />
      <div className="flex flex-col items-center">
        <div className="fixed bottom-24 right-6 z-20 md:right-8">
          <button className="btn-accent btn-circle btn" onClick={onSearch}>
            <span>
              <BiSearch className="h-6 w-6"></BiSearch>
            </span>
          </button>
        </div>
        <div className="w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
          <CustomerSaleList stateReducer={stateReducer} dispatch={dispatch} />
        </div>
      </div>
    </section>
  );
}
