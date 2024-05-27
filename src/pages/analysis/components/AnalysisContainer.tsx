import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../stores/api";
import AnalysisResult from "./AnalysisResult";
import { AlertFromQueryError } from "../../../components/Alert";
import Spinner from "../../../components/Spinner";

export default function AnalysisContainer({ renderForm }) {
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

  const onFormSubmit = (url: string) => {
    setQueryURL(url);
  };

  return (
    <section className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-11/12 lg:w-8/12">
          {renderForm(onFormSubmit)}

          {/* TODO: Add more strict status check here later. */}
          {/* Since query is disabled at the beginning,
          query is NOT fetching, but the status is loading. We want to make sure to only show spinner on actual network call. */}
          {!analyticQuery.isFetching && analyticQuery.status === "loading" ? (
            <></>
          ) : analyticQuery.status === "loading" ||
            analyticQuery.fetchStatus === "fetching" ? (
            // The fetchStatus check is necessary because when user request the same data,
            // query will return data (cuz it's in cache) without triggering the .status change, which cause Result to not render correctly.
            // Therefore, we want to make sure the queryFn is actually running as well.
            <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-8/12">
              <Spinner></Spinner>
            </div>
          ) : analyticQuery.status === "error" ? (
            <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-8/12">
              <AlertFromQueryError queryError={analyticQuery.error} />
            </div>
          ) : (
            <AnalysisResult
              columns={["Customer", "Box"]}
              data={analyticQuery.data}
            />
          )}
        </div>
      </div>
    </section>
  );
}
