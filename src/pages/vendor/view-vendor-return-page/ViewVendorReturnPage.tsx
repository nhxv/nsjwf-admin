import { useEffect, useState } from "react";
import { BiBot } from "react-icons/bi";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import VendorReturnList from "./components/VendorReturnList";

export default function ViewVendorReturnPage() {
  const isFirstRender = useFirstRender();
  const [listState, setListState] = useState({
    listError: "",
    listEmpty: "",
    listLoading: true,
  });
  const [vendorReturnList, setVendorReturnList] = useState([]);

  useEffect(() => {
    api.get(`/vendor-returns`)
    .then((res) => {
      if (res.data.length === 0) {
        setListState(prev => ({
          ...prev, 
          listEmpty: "Such hollow, much empty...", 
          listLoading: false,
        }));
      } else {
        setVendorReturnList(res.data);
        setListState(prev => ({...prev, listError: "", listEmpty: "", listLoading: false}));
      }

    })
    .catch((e) => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setListState(prev => (
        {...prev, listError: error.message, listLoading: false}
      ));
    });
  }, []);

  useEffect(() => {
    if (!isFirstRender) {
      setListState(prev => ({...prev, listError: "", listEmpty: "", listLoading: false}));
    }
  }, [vendorReturnList]);

  return (
  <>
  <section className="min-h-screen">
    <h1 className="text-center font-bold text-xl my-4">Vendor return</h1>
    <div className="flex justify-center">  
      <div className="w-11/12 sm:w-8/12 xl:w-6/12">
        {listState.listLoading ? (
        <Spinner></Spinner>
        ) : (
        <>
          {listState.listError ? (
          <Alert message={listState.listError} type="error"></Alert>
          ) : (
          <>
            {listState.listEmpty ? (
            <Alert message={listState.listEmpty} type="empty"></Alert>
            ) : (
            <VendorReturnList returns={vendorReturnList} />
            )}
          </>
          )}
        </>)}        
      </div>
    </div>    
  </section>
  </>
  );
}