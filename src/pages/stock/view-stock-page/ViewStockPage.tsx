import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "../../../commons/role.enum";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import { useAuthStore } from "../../../stores/auth.store";

export default function ViewStockPage() {
  const [stock, setStock] = useState(null);
  const [dataState, setDataState] = useState({
    error: "",
    empty: "",
    loading: true,
  });
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    api.get(`/product-stock`)
    .then((res) => {
      if (res.data.length === 0) {
        setDataState(prev => (
          {...prev, empty: "Such hollow, much empty...", loading: false}
        ));
      } else {
        setStock(res.data);
        setDataState(prev => ({...prev, empty: "", loading: false}));
      }
    })
    .catch((e) => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setDataState(prev => (
        {...prev, error: error.message, loading: false}
      ));
    })
  }, []);

  const onChangeStock = () => {
    navigate(`/stock/change-stock`);
  }

  return (
    <>
      <section className="min-h-screen">
        <h1 className="text-center font-bold text-xl my-4">View stock</h1>
        <div className="flex flex-col items-center">
          {dataState.loading ? (
          <Spinner></Spinner>
          ) : (
          <div className="w-11/12 sm:w-8/12 md:w-6/12">
            {dataState.error ? (
            <Alert message={dataState.error} type="error"></Alert>
            ) : (
            <>
              {dataState.empty ? (
              <Alert message={dataState.empty} type="empty"></Alert>
              ) : (
              <>
                <div className="bg-base-100 p-6 rounded-box shadow-md mb-12">
                  {stock.map((product) => (
                  <div key={product.productName} className="flex justify-between py-3 bg-base-200 rounded-btn mb-2">
                    <div className="mx-3"><span>{product.productName}</span></div>
                    <div className="mx-3"><span>{product.quantity}</span></div>
                  </div>
                  ))}
                  {role === Role.MASTER || role === Role.ADMIN ? (
                  <button type="button" className="mt-4 btn btn-primary w-full" onClick={onChangeStock}>Change stock</button>
                  ) : null}
                </div>   
              </>
              )}
            </>
            )}
          </div>
          )}
        </div>  
      </section>
    </>
  )
}