import { useFormik } from "formik";
import { convertTime } from "../../../../commons/utils/time.util";
import DateInput from "../../../../components/forms/DateInput";
import TextInput from "../../../../components/forms/TextInput";

interface FormFields {
  start_date: string;
  end_date: string;
  product: string;
}

export default function CustomerSaleAnalysisForm({ onSubmit }) {
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
      onSubmit(url);
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

  return (
    <div className="custom-card mx-auto">
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
        </div>
      </form>
    </div>
  );
}
