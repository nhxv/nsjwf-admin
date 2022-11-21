import { useState } from "react";
import { useFormik } from "formik";
import { ProductResponse } from "../../../../models/product-response.model";
import api from "../../../../stores/api";
import SearchInput from "../../../../components/SearchInput";
import Spinner from "../../../../components/Spinner";
import { BiSearch, BiTrash, BiEdit } from "react-icons/bi";
import { useProductConfigStore } from "../../../../stores/product-config.store";

export default function ProductSearch() {
  const initialSearchMessage = "Your search result will appear here";
  const [searchMessage, setSearchMessage] = useState<string>(initialSearchMessage);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [productFound, setProductFound] = useState<ProductResponse[]>([]);
  const editProductConfig = useProductConfigStore((state) => state.editProductConfig);

  const searchForm = useFormik({
    initialValues: {
      keyword: ""
    },
    onSubmit: async (data) => {
      setProductFound([]);
      setLoading(true);
      try {
        const res = await api.get(`/products/basic-search?keyword=${data.keyword}`);
        const resData: ProductResponse[] = res.data;
        setLoading(false);
        if (resData.length < 1) {
          setSearchMessage("No result found");
        }
        setProductFound(resData);
      } catch (e) {
        setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        setSearchMessage(error.message);
        searchForm.resetForm();
      }
    }
  });

  const onEdit = (product) => {
    editProductConfig(product);
    setProductFound([]);
    searchForm.resetForm();
  }

  const onClearAll = () => {
    setProductFound([]);
    setSearchMessage(initialSearchMessage);
    searchForm.resetForm();
  }

  return (
  <>
    <div className="w-12/12 sm:w-12/12 md:w-5/12 mt-12">
      <form onSubmit={searchForm.handleSubmit} className="flex flex-col justify-center">
        <div className="mb-5 flex">
          <SearchInput id="product-search" name="keyword" placeholder="Search by product's name" 
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
        {productFound && productFound.length > 0 && !isLoading ? (
        <>
          {productFound.map((product) => (
          <div key={product.id} className="w-full">
            <div className="flex flex-col md:flex-row md:justify-between 
            p-6 bg-white rounded-box shadow-md mb-4 w-full">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-400">{product.discontinued ? "Discontinued" : "In use"}</p>
              </div>

              <button className="btn btn-info text-blue-600 w-full md:w-fit mt-4 md:mt-0"
              onClick={() => onEdit(product)}>
                <BiEdit className="w-6 h-6"></BiEdit>
              </button>
            </div>
          </div>
          ))}
          <div className="flex justify-center items-center mt-4">
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