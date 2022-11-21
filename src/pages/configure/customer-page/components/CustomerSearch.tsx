import { useState } from "react";
import { useFormik } from "formik";
import api from "../../../../stores/api";
import SearchInput from "../../../../components/SearchInput";
import Spinner from "../../../../components/Spinner";
import { BiSearch, BiTrash, BiEdit } from "react-icons/bi";
import { useCustomerConfigStore } from "../../../../stores/customer-config.store";
import { CustomerResponse } from "../../../../models/customer-response.model";

export default function CustomerSearch() {
  const initialSearchMessage = "Your search result will appear here";
  const [searchMessage, setSearchMessage] = useState<string>(initialSearchMessage);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [customerFound, setCustomerFound] = useState<CustomerResponse[]>([]);
  const editCustomerConfig = useCustomerConfigStore((state) => state.editCustomerConfig);

  const searchForm = useFormik({
    initialValues: {
      keyword: ""
    },
    onSubmit: async (data) => {
      setCustomerFound([]);
      setLoading(true);
      try {
        const res = await api.get(`/customers/basic-search?keyword=${data.keyword}`);
        const resData: CustomerResponse[] = res.data;
        setLoading(false);
        if (resData.length < 1) {
          setSearchMessage("No result found");
        }
        setCustomerFound(resData);
      } catch (e) {
        setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        setSearchMessage(error.message);
        searchForm.resetForm();
      }
    }
  });

  const onEdit = (customer) => {
    editCustomerConfig(customer);
    setCustomerFound([]);
    searchForm.resetForm();
  }

  const onClearAll = () => {
    setCustomerFound([]);
    setSearchMessage(initialSearchMessage);
    searchForm.resetForm();
  }

  return (
  <>
    <div className="w-12/12 sm:w-12/12 md:w-5/12 mt-12">
      <form onSubmit={searchForm.handleSubmit} className="flex flex-col justify-center">
        <div className="mb-5 flex">
          <SearchInput id="customer-search" name="keyword" placeholder="Search by customer's name" 
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
        {customerFound && customerFound.length > 0 && !isLoading ? (
        <>
          {customerFound.map((customer) => (
          <div key={customer.id} className="w-full">
            <div className="flex flex-col md:flex-row md:justify-between 
            p-6 bg-white rounded-box shadow-md mb-4 w-full">
              <div>
                <p className="font-medium">{customer.name}</p>
                <small className="text-sm text-gray-400">Address</small>
                <p>{customer.address ? customer.address : "Unknown"}</p>
                <small className="text-sm text-gray-400">Phone</small>
                <p>{customer.phone ? customer.phone : "Unknown"}</p>
                <small className="text-sm text-gray-400">Email</small>
                <p>{customer.email ? customer.email : "Unknown"}</p>
                <small className="text-sm text-gray-400">Presentative</small>
                <p>{customer.presentative ? customer.presentative : "Unknown"}</p>
                <small className="text-sm text-gray-400">Status</small>
                <p>{customer.discontinued ? "Discontinued" : "In use"}</p>
              </div>

              <button className="btn btn-info text-blue-600 w-full md:w-fit mt-4 md:mt-0"
              onClick={() => onEdit(customer)}>
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