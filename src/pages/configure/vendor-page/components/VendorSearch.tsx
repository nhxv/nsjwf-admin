import { useState } from "react";
import { useFormik } from "formik";
import api from "../../../../stores/api";
import SearchInput from "../../../../components/SearchInput";
import Spinner from "../../../../components/Spinner";
import { BiSearch, BiTrash, BiEdit } from "react-icons/bi";
import { useVendorConfigStore } from "../../../../stores/vendor-config.store";
import { VendorResponse } from "../../../../models/vendor-response.model";

export default function VendorSearch() {
  const initialSearchMessage = "Your search result will appear here";
  const [searchMessage, setSearchMessage] = useState<string>(initialSearchMessage);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [vendorFound, setVendorFound] = useState<VendorResponse[]>([]);
  const editVendorConfig = useVendorConfigStore((state) => state.editVendorConfig);

  const searchForm = useFormik({
    initialValues: {
      keyword: ""
    },
    onSubmit: async (data) => {
      setVendorFound([]);
      setLoading(true);
      try {
        const res = await api.get(`/vendors/basic-search?keyword=${data.keyword}`);
        const resData: VendorResponse[] = res.data;
        setLoading(false);
        if (resData.length < 1) {
          setSearchMessage("No result found");
        }
        setVendorFound(resData);
      } catch (e) {
        setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        setSearchMessage(error.message);
        searchForm.resetForm();
      }
    }
  });

  const onEdit = (vendor) => {
    editVendorConfig(vendor);
    setVendorFound([]);
    searchForm.resetForm();
  }

  const onClearAll = () => {
    setVendorFound([]);
    setSearchMessage(initialSearchMessage);
    searchForm.resetForm();
  }

  return (
  <>
    <div className="w-12/12 sm:w-12/12 md:w-5/12 mt-12">
      <form onSubmit={searchForm.handleSubmit} className="flex flex-col justify-center">
        <div className="mb-5 flex">
          <SearchInput id="vendor-search" name="keyword" placeholder="Search by vendor's name" 
          value={searchForm.values.keyword} onChange={searchForm.handleChange} />
          <button type="submit" className="btn btn-accent border-gray-400 ml-2">
            <BiSearch className="w-6 h-6"></BiSearch>
          </button>
        </div>
      </form>
    </div>
    <div className="w-11/12 sm:w-6/12 md:w-5/12">
      <div className="flex flex-col justify-center items-center">
        {isLoading ? (
          <>
            <Spinner></Spinner>
          </>
        ) : (<></>)
        }
        {vendorFound && vendorFound.length > 0 && !isLoading ? (
        <>
          {vendorFound.map((vendor) => (
          <div key={vendor.id} className="w-full">
            <div className="flex flex-col md:flex-row md:justify-between 
            p-6 bg-white rounded-box shadow-md mb-4 w-full">
              <div>
                <p className="font-medium">{vendor.name}</p>
                <small className="text-sm text-gray-400">Address:</small>
                <p>{vendor.address ? vendor.address : "Unknown"}</p>
                <small className="text-sm text-gray-400">Phone:</small>
                <p>{vendor.phone ? vendor.phone : "Unknown"}</p>
                <small className="text-sm text-gray-400">Email:</small>
                <p>{vendor.email ? vendor.email : "Unknown"}</p>
                <small className="text-sm text-gray-400">Presentative:</small>
                <p>{vendor.presentative ? vendor.presentative : "Unknown"}</p>
                <small className="text-sm text-gray-400">Status:</small>
                <p>{vendor.discontinued ? "Discontinued" : "In use"}</p>
              </div>

              <button className="btn btn-info text-blue-600 w-full md:w-fit mt-4 md:mt-0"
              onClick={() => onEdit(vendor)}>
                <BiEdit className="w-6 h-6"></BiEdit>
              </button>
            </div>
          </div>
          ))}
          <div className="mt-4">
            <button className="btn btn-accent" onClick={onClearAll}>
              <span className="mr-2">Clear search result(s)</span>
              <BiTrash className="w-6 h-6"></BiTrash>
            </button>
          </div>
        </>
        ) : (
        <>
          <p className=" text-gray-500">{searchMessage}</p>
        </>
        )}
      </div>
    </div>  
  </>
  )
}