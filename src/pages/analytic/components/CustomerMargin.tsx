import { useFormik } from "formik";
import { convertTime } from "../../../commons/utils/time.util";
import DateInput from "../../../components/forms/DateInput";

export default function CustomerMargin({ isOpen, onSubmit }) {
  const searchForm = useFormik({
    initialValues: {
      start_date: convertTime(new Date()),
      end_date: convertTime(new Date()),
    },
    onSubmit: (formData) => {
      onSubmit("/analytic/customer-margin");
    },
  });

  if (!isOpen) return <></>;

  return (
    <form onSubmit={searchForm.handleSubmit} className="custom-card text-left">
      <div className="flex justify-between gap-2">
        <div className="w-full">
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
        <div className="w-full">
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

      <div className="mt-4 flex justify-center">
        <button className="btn btn-primary w-1/2 min-w-fit" type="submit">
          Fake Submit
        </button>
      </div>
    </form>
  );
}
