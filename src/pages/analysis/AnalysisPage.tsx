import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../stores/api";
import AnalysisResult from "./components/AnalysisResult";
import CustomerRanking from "./components/CustomerRanking";
import { BiUser, BiStore } from "react-icons/bi";
import ProductRanking from "./components/ProductRanking";
import { AlertFromQueryError } from "../../components/Alert";
import Spinner from "../../components/Spinner";

type OptionInfo = {
  displayName: string;
  description: string;
  icon: React.ReactNode;
};

// To add a new form option, follow this array example.
const FORMS_TRIGGERS: Array<OptionInfo> = [
  {
    displayName: "Customer Product",
    description: "Show which customers bought the most boxes in a time period.",
    icon: <BiUser className="h-3/4 w-full" />,
  },
  {
    displayName: "Product Count",
    description: "Show which products were the top picks in a time period.",
    icon: <BiStore className="h-3/4 w-full" />,
  },
  // {
  //   displayName: "Customer Margin",
  //   description: "WIP",
  //   icon: <BiLineChart className="h-3/4 w-full" />,
  // },
  // {
  //   displayName: "Product Margin",
  //   description: "WIP",
  //   icon: <BiSolidObjectsVerticalBottom className="h-3/4 w-full" />,
  // },
];

function isFormOpen(state: number, formIndex: number) {
  return state == formIndex;
}

function AnalyticOption({ formIndex, onClick, children, style = null }) {
  // p-0 cuz sticker adds padding on all 4 sides.
  // The manual shadow mess is based on here: https://stackoverflow.com/a/57678000 and https://moderncss.dev/expanded-use-of-box-shadow-and-border-radius/#box-shadow-hacks-for-images
  // basically make the bg brighter/darker when hover.
  let styleName = `card sticker p-0 h-full col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3 max-h-72 lg:xl:max-h-full
    hover:dark:shadow-[inset_0_0_0_100vmax_rgba(255,255,255,0.05)] hover:shadow-[inset_0_0_0_100vmax_rgba(0,0,0,0.05)] sticker-primary`;
  if (style !== null) {
    styleName = style;
  }

  return (
    <button className={styleName} onClick={() => onClick(formIndex)}>
      {children}
    </button>
  );
}

export default function AnalysisPage() {
  const [pageState, setPageState] = useState({
    page: 0,
    focusForm: -1,
  });

  const [queryURL, setQueryURL] = useState("");
  const analyticQuery = useQuery({
    queryKey: ["analytic", queryURL],
    queryFn: async () => {
      const result = await api.get(queryURL);

      return result.data;
    },
    // NOTE: Probably use skipToken if React Query is on v5+.
    // https://tanstack.com/query/v5/docs/framework/react/guides/disabling-queries#typesafe-disabling-of-queries-using-skiptoken
    enabled: !!queryURL,
    refetchOnWindowFocus: false,
  });

  const onFormChosen = (formIndex: number) => {
    setPageState((prev) => ({
      ...prev,
      focusForm: formIndex,
    }));
    onNextPage();
  };
  const onFormSubmit = (url: string) => {
    setQueryURL(url);
  };
  const onNextPage = () => {
    setPageState((prev) => ({
      ...prev,
      page: 1,
    }));
  };
  const onFormClose = () => {
    setPageState((prev) => ({
      ...prev,
      focusForm: -1,
    }));
  };
  const onToPreviousPage = () => {
    setPageState((prev) => ({
      ...prev,
      page: 0,
    }));
    onFormClose();
  };

  return (
    <section className="min-h-screen">
      {pageState.page === 0 ? (
        <>
          <div className="flex flex-col gap-12">
            <div className="sm:lg:min-h-42 xl:min-h-72 grid grid-cols-12 gap-2">
              {FORMS_TRIGGERS.map((option, i) => (
                <AnalyticOption formIndex={i} onClick={onFormChosen}>
                  {option.icon}
                  <div className="card-body pt-0">
                    <div className="card-title">{option.displayName}</div>
                    <div className="hidden lg:xl:text-left lg:xl:block">
                      {option.description}
                    </div>
                  </div>
                </AnalyticOption>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center">
          <div className="w-11/12 lg:w-8/12">
            <CustomerRanking
              isOpen={isFormOpen(pageState.focusForm, 0)}
              onSubmit={onFormSubmit}
              onToPreviousPage={onToPreviousPage}
            />
            <ProductRanking
              isOpen={isFormOpen(pageState.focusForm, 1)}
              onSubmit={onFormSubmit}
              onToPreviousPage={onToPreviousPage}
            />

            {/* TODO: Add more strict status check here later. */}
            {!analyticQuery.isFetching && analyticQuery.status === "loading" ? (
              <></>
            ) : analyticQuery.status === "loading" ? (
              <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-8/12">
                <Spinner></Spinner>
              </div>
            ) : analyticQuery.status === "error" ? (
              <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-8/12">
                <AlertFromQueryError queryError={analyticQuery.error} />
              </div>
            ) : (
              <AnalysisResult data={analyticQuery.data} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
