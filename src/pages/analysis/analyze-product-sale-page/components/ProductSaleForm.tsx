import { Controller, useForm } from "react-hook-form";
import { convertTime } from "../../../../commons/utils/time.util";
import DateInput from "../../../../components/forms/DateInput";

interface FormFields {
  start_date: string;
  end_date: string;
}

export default function ProductSaleForm({ onFormSubmit, onFormClear }) {
  const today = new Date();
  const { control, handleSubmit, reset } = useForm<FormFields>({
    defaultValues: {
      start_date: convertTime(new Date(today.getFullYear(), today.getMonth(), 1)),
      end_date: convertTime(today),
    },
  });

  const onSubmit = (formData: FormFields) => {
    let url = "/analysis/analyze-product-sale?";
    url += `start_date=${formData.start_date}&`;
    url += `end_date=${formData.end_date}&`;
    onFormSubmit(url);
  };

  const onClear = () => {
    reset();
    onFormClear();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="custom-card mx-auto">
      <div className="flex flex-col justify-between gap-2 sm:flex-row">
        <div className="w-full">
          <label className="custom-label mb-2 inline-block">From</label>
          <Controller
            name="start_date"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DateInput
                id="start_date"
                min="2022-01-01"
                max="2100-12-31"
                placeholder="Date"
                name={field.name}
                value={field.value}
                onChange={field.onChange}></DateInput>
            )}
          />
        </div>
        <div className="w-full">
          <label className="custom-label mb-2 inline-block">To</label>
          <Controller
            name="end_date"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DateInput
                id="end_date"
                min="2022-01-01"
                max="2100-12-31"
                placeholder="Date"
                name={field.name}
                value={field.value}
                onChange={field.onChange}></DateInput>
            )}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <button className="btn btn-primary w-full" type="submit">
          Submit
        </button>
        <button className="btn btn-accent w-full" type="button" onClick={onClear}>
          Clear all
        </button>
      </div>
    </form>
  );
}
