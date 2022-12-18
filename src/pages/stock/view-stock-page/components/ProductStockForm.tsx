import { useEffect, useState } from "react";
import api from "../../../../stores/api";
import { useFormik } from "formik";
import TextInput from "../../../../components/forms/TextInput";
import Spinner from "../../../../components/Spinner";
import { BiCheckDouble, BiError } from "react-icons/bi";
import { ProductStockChangeReason } from "../../../../commons/product-stock-change-reason.enum";
import { useAuthStore } from "../../../../stores/auth.store";
import { Role } from "../../../../commons/role.enum";

export default function ProductStockForm({ initialData, stocks, onClear }) {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });
  const role = useAuthStore(state => state.role);

  const productStockForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      if (role !== Role.MASTER && role !== Role.ADMIN) {
        return;
      }
      setFormState(prev => ({...prev, success: "", error: "", loading: true}));
      try {
        const reqData = [];
        for (const property in data) {
          const item = {id: -1, quantity: -1};
          item.id = +property.replace("stock", "");
          item.quantity = data[property];
          reqData.push(item);
        }
        const res = await api.put(
          `/product-stock/${ProductStockChangeReason.SELF_EDIT}`, 
          reqData
        );
        setFormState(prev => ({
          ...prev, 
          success: "Update stock successfully.", 
          error: "", 
          loading: false
        }));
        setTimeout(() => {
          setFormState(prev => ({...prev, success: ""}));
          onClear();
        }, 2000);
      } catch (e) {
        const error = JSON.parse(JSON.stringify(
          e.response ? e.response.data.error : e
        ));
        setFormState(prev => ({...prev, error: error.message, success: "", loading: false}));
      }
    }
  });

  const onClearForm = () => {
    onClear();
  }

  return (
  <>
    <form onSubmit={productStockForm.handleSubmit}>
      {stocks.map((stock) => {
        return (
        <div key={stock.id}>
          <div className="flex justify-between items-center mb-4">
            <div className="w-6/12">
              <span>{stock.productName}</span>
            </div>
            <div className="w-4/12 md:w-3/12">
              <TextInput id={`stock${stock.id}`} type="number" 
                name={`stock${stock.id}`} placeholder="Qty" 
                value={productStockForm.values[`stock${stock.id}`]}
                onChange={productStockForm.handleChange}></TextInput> 
            </div>
          </div>
          <div className="divider"></div>
        </div>
        )
      })}
      {role === Role.MASTER || role === Role.ADMIN ? (
      <>
        <button type="submit" className="btn btn-primary text-white w-full mt-1">
          <span>Update stock</span>
        </button>
        <button type="button" className="btn btn-accent text-black w-full mt-3" 
        onClick={onClearForm}>
          <span>Clear change(s)</span>
        </button>      
      </>
      ) : (<></>)}

      <div>
        {formState.loading ? (
        <>
          <div className="mt-5 flex justify-center">
            <Spinner></Spinner>
          </div>
        </>
        ) : (<></>)}
        {formState.success ? (
        <>
          <div className="mt-5 alert alert-success text-green-700 flex justify-center">
            <div>
              <BiCheckDouble className="flex-shrink-0 w-6 h-6"></BiCheckDouble>
              <span>{formState.success}</span>
            </div>
          </div>
        </>
        ) : (<></>)}
        {formState.error ? (
        <>
          <div className="mt-5 alert alert-error text-red-700 flex justify-center">
            <div>
              <BiError className="flex-shrink-0 w-6 h-6"></BiError>
              <span>{formState.error}</span>
            </div>
          </div>        
        </>
        ) : (<></>)}
      </div>
    </form>        
  </>
  )
}