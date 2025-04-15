import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Location } from "../../../../commons/enums/location.enum";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import ProductForm from "./ProductForm";
import { handleTokenExpire } from "../../../../commons/utils/token.util";

export default function ProductFormContainer() {
  const params = useParams();
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);
  const [fetchData, setFetchData] = useState({
    units: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});

  useEffect(() => {
    if (params.id) {
      api
        .get(`/products/find/${params.id}`)
        .then((res) => {
          setInitialFields((prev) => ({
            ...prev,
            name: res.data.name,
            location: res.data.location_name
              ? res.data.location_name
              : Location.COOLER_1,
            discontinued: res.data.discontinued,
          }));
          setFetchData((prev) => ({
            ...prev,
            units: res.data.units,
            error: "",
            empty: "",
            loading: false,
          }));
        })
        .catch((e) => {
          const error = JSON.parse(
            JSON.stringify(e.response ? e.response.data.error : e)
          );
          setFetchData((prev) => ({
            ...prev,
            empty: "",
            error: error.message,
            loading: false,
          }));

          if (error.status === 401) {
            handleTokenExpire(navigate, setFetchData);
          }
        });
    } else {
      setFetchData((prev) => ({
        ...prev,
        error: "",
        empty: "",
        loading: false,
      }));
      // create product
      setInitialFields((prev) => ({
        ...prev,
        name: "",
        location: Location.COOLER_1,
        discontinued: false,
      }));
    }
  }, [reload, params]);

  const onClear = () => {
    setReload(!reload);
    setFetchData((prev) => ({
      ...prev,
      units: [],
      error: "",
      empty: "",
      loading: true,
    }));
  };

  if (fetchData.loading) return <Spinner></Spinner>;
  if (fetchData.error)
    return <Alert message={fetchData.error} type="error"></Alert>;
  if (fetchData.empty)
    return <Alert message={fetchData.empty} type="empty"></Alert>;

  return (
    <div className="custom-card mb-12">
      <ProductForm
        editedId={params?.id ? params.id : null}
        units={fetchData.units.length > 0 ? fetchData.units : null}
        initialData={initialFields}
        onClear={onClear}
      />
    </div>
  );
}
