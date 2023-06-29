import { BiX } from "react-icons/bi";
import Modal from "../../../../components/Modal";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import DateInput from "../../../../components/forms/DateInput";
import SelectSearch from "../../../../components/forms/SelectSearch";
import TextInput from "../../../../components/forms/TextInput";
import api from "../../../../stores/api";
import { ACTION_TYPE } from "../../../../commons/hooks/report-sale.hook";

export default function SearchSaleModal({
  isOpen,
  onClose,
  stateReducer,
  dispatch,
}) {
  const navigate = useNavigate();

  const searchForm = useFormik({
    initialValues: {
      manualCode: "",
      customer: "",
      product: "",
      date: "",
    },
    onSubmit: async (form_data) => {
      dispatch({
        type: ACTION_TYPE.LOADING,
      });

      let url = "";
      if (form_data.manualCode) {
        url += `code=${encodeURIComponent(form_data.manualCode)}&`;
      }
      if (form_data.date) {
        url += `date=${form_data.date}&`;
      }
      if (Object.keys(form_data.customer).length !== 0) {
        url += `customer=${encodeURIComponent(form_data.customer)}&`;
      }
      if (Object.keys(form_data.product).length !== 0) {
        url += `product=${encodeURIComponent(form_data.product)}&`;
      }
      try {
        const res = await api.get(`/customer-orders/sold/search?${url}`);
        if (res.data.length < 1) {
          dispatch({
            type: ACTION_TYPE.EMPTY,
          });
        } else {
          dispatch({
            type: ACTION_TYPE.SUCCESS,
            reports: res.data,
            reports_url: `/customer-orders/sold/search?${url}`,
          });
        }
      } catch (e) {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        dispatch({
          type: ACTION_TYPE.ERROR,
          error: error.message,
        });

        if (error.status === 401) {
          handleTokenExpire(navigate, dispatch, (_, msg) => ({
            type: ACTION_TYPE.ERROR,
            error: msg,
          }));
        } else {
          searchForm.resetForm();
        }
      }
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideOverflow={false}>
      <div className="custom-card text-left">
        <div className="flex justify-end">
          <button
            type="button"
            className="btn-accent btn-sm btn-circle btn"
            onClick={onClose}
          >
            <span>
              <BiX className="h-6 w-6"></BiX>
            </span>
          </button>
        </div>
        <form onSubmit={searchForm.handleSubmit} className="mb-8">
          <div className="mb-6 flex flex-col gap-4 xl:grid xl:grid-cols-2">
            <div>
              <label className="custom-label mb-2 inline-block">Code</label>
              <TextInput
                id="by-code"
                placeholder="Code"
                name="by-code"
                value={searchForm.values.manualCode}
                onChange={(e) =>
                  searchForm.setFieldValue("manualCode", e.target.value)
                }
              />
            </div>
            <div>
              <label className="custom-label mb-2 inline-block">
                Completed on
              </label>
              <DateInput
                id="date"
                min="2022-01-01"
                max="2100-12-31"
                placeholder="Date"
                name="date"
                value={searchForm.values.date}
                onChange={searchForm.handleChange}
              ></DateInput>
            </div>
            <div>
              <label className="custom-label mb-2 inline-block">Customer</label>
              <SelectSearch
                name="customer-select"
                value={searchForm.values.customer}
                setValue={(customer) => {
                  // This can be null, and we don't want that.
                  searchForm.setFieldValue(
                    "customer",
                    customer ? customer : ""
                  );
                }}
                options={stateReducer.customers.map((v) => v.name)}
                nullable={true}
              />
            </div>

            <div>
              <label className="custom-label mb-2 inline-block">Product</label>
              <SelectSearch
                name="product-select"
                value={searchForm.values.product}
                setValue={(product) => {
                  // This can be null, and we don't want that.
                  searchForm.setFieldValue("product", product ? product : "");
                }}
                options={stateReducer.products.map((v) => v.name)}
                nullable={true}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="btn-accent btn w-full"
              disabled={stateReducer.loading}
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
