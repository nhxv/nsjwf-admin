import useFirstRender from "../../../../commons/hooks/first-render.hook";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import Alert from "../../../../components/Alert";
import ProductForm from "./ProductForm";

export default function ProductFormContainer() {
  const isFirstRender = useFirstRender();
  const params = useParams();
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
        });
    } else {
      setFetchData((prev) => ({
        ...prev,
        error: "",
        empty: "",
        loading: false,
      }));
      // create product
      setInitialFields((prev) => ({ ...prev, name: "", discontinued: false }));
    }
  }, [reload, params]);

  useEffect(() => {
    if (!isFirstRender) {
      setFetchData((prev) => ({
        ...prev,
        error: "",
        empty: "",
        loading: false,
      }));
    }
  }, [initialFields]);

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
