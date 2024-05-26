import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useState } from "react";
import { convertTime } from "../../../commons/utils/time.util";
import { AlertFromQueryError } from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import DateInput from "../../../components/forms/DateInput";
import TextInput from "../../../components/forms/TextInput";
import api from "../../../stores/api";
import AnalysisResult from "../components/AnalysisResult";

interface FormFields {
  start_date: string;
  end_date: string;
  product: string;
}

export default function AnalyzeCustomerSalePage() {
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

  const searchForm = useFormik<FormFields>({
    initialValues: {
      start_date: convertTime(new Date()),
      end_date: convertTime(new Date()),
      product: "",
    },
    onSubmit: (formData) => {
      let url = "/analytic/customer-buy-power?";
      url += `start_date=${formData.start_date}&`;
      url += `end_date=${formData.end_date}&`;
      if (formData.product.length !== 0) {
        url += `product=${encodeURIComponent(formData.product)}`;
      }
      setQueryURL(url);
    },
    validate: (values) => {
      const errors = {};
      if (!values.start_date) {
        errors["start_date"] = "Required";
      }
      if (!values.end_date) {
        errors["end_date"] = "Required";
      }
      return errors;
    },
  });

  const onClear = () => {
    // TODO
    return;
  }

  return (
    <section className="min-h-screen">
      <div className="custom-card mx-auto w-11/12 xl:w-8/12">
        <form onSubmit={searchForm.handleSubmit}>
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="xl:basis-6/12">
              <label className="custom-label mb-2 inline-block">Product</label>
              <TextInput
                id="product-select"
                name="product-select"
                placeholder="Keywords"
                onChange={(e) => {
                  searchForm.setFieldValue(
                    "product",
                    e.target.value ? e.target.value : ""
                  );
                }}
                value={searchForm.values.product}
              />
            </div>
            <div className="xl:basis-3/12">
              <label className="custom-label mb-2 inline-block">From</label>
              <DateInput
                id="start_date"
                min="2022-01-01"
                max="2100-12-31"
                placeholder="Date"
                name="start_date"
                value={searchForm.values.start_date}
                onChange={searchForm.handleChange}
              ></DateInput>
            </div>
            <div className="xl:basis-3/12">
              <label className="custom-label mb-2 inline-block">To</label>
              <DateInput
                id="start_date"
                min="2022-01-01"
                max="2100-12-31"
                placeholder="Date"
                name="start_date"
                value={searchForm.values.end_date}
                onChange={searchForm.handleChange}
              ></DateInput>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button className="btn btn-primary basis-full" type="submit">
              Submit
            </button>
            <button
              className="btn btn-accent basis-full"
              type="button"
              onClick={onClear}
            >
              Clear all
            </button>
          </div>
        </form>
      </div>
      
      {/* TODO: Add more strict status check here later. */}
      <div className="mx-auto w-11/12 xl:w-8/12">
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
    </section>
  );
}