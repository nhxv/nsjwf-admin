import { useReducer } from "react";
import { convertTime } from "../utils/time.util";

export const ACTION_TYPE = {
  TO_DEFAULT: "to_default",
  LOADING: "to_loading",
  SUCCESS: "success",
  ERROR: "error",
  EMPTY: "empty",
  REVERT_ORDER: "revert_order",
  TRIGGER_RELOAD: "trigger_reload",
  TOGGLE_SORT: "toggle_sort",
};

const INITIAL_STATE = {
  reports_url: `/customer-orders/sold/search?date=${convertTime(new Date())}`,
  reports: [],
  customers: [],
  products: [],
  error: "",
  empty: "",
  loading: true,
  oldest_first: false,
  // This is only to send a signal for useEffect() to run/refetch data, the actual value doesn't matter.
  reload: false,
};

const reducer = (state, action) => {
  // Only TO_DEFAULT will reset all the fetched data to empty list.
  switch (action.type) {
    case ACTION_TYPE.TO_DEFAULT: {
      return INITIAL_STATE;
    }
    case ACTION_TYPE.LOADING: {
      return {
        ...state,
        error: "",
        loading: true,
      };
    }
    case ACTION_TYPE.SUCCESS: {
      return {
        ...state,
        loading: false,
        empty: "",
        customers: action.customers ? action.customers : state.customers,
        products: action.products ? action.products : state.products,
        reports: action.reports ? action.reports : state.reports,
        reports_url: action.reports_url
          ? action.reports_url
          : state.reports_url,
      };
    }
    case ACTION_TYPE.ERROR: {
      return {
        ...state,
        loading: false,
        empty: "",
        error: action.error,
      };
    }
    case ACTION_TYPE.EMPTY: {
      return {
        ...state,
        loading: false,
        empty: "Such hollow, much empty...",
      };
    }
    case ACTION_TYPE.REVERT_ORDER: {
      const newReports = state.reports.filter(
        (r) => r.orderCode != action.code
      );
      return {
        ...state,
        loading: false,
        empty: newReports.length > 0 ? "" : "Such hollow, much empty...",
        reports: newReports,
      };
    }
    case ACTION_TYPE.TRIGGER_RELOAD: {
      return {
        ...state,
        reload: !state.reload,
      };
    }
    case ACTION_TYPE.TOGGLE_SORT: {
      return {
        ...state,
        oldest_first: !state.oldest_first,
        reports: state.reports.toReversed(),
      };
    }
  }
};

export const useSaleReducer = () => {
  return useReducer(reducer, INITIAL_STATE);
};
