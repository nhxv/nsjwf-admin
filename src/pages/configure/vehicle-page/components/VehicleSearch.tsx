import { useState } from "react";
import { useFormik } from "formik";
import api from "../../../../stores/api";
import SearchInput from "../../../../components/SearchInput";
import Spinner from "../../../../components/Spinner";
import { BiSearch, BiTrash, BiEdit } from "react-icons/bi";
import { useVehicleConfigStore } from "../../../../stores/vehicle-config.store";
import { VehicleResponse } from "../../../../models/vehicle-response.model";

export default function VehicleSearch() {
  const initialSearchMessage = "Your search result will appear here.";
  const [searchMessage, setSearchMessage] = useState<string>(initialSearchMessage);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [vehicleFound, setVehicleFound] = useState<VehicleResponse[]>([]);
  const editVehicleConfig = useVehicleConfigStore((state) => state.editVehicleConfig);

  const searchForm = useFormik({
    initialValues: {
      keyword: ""
    },
    onSubmit: async (data) => {
      setVehicleFound([]);
      setLoading(true);
      try {
        const res = await api.get(`/vehicles/basic-search?keyword=${data.keyword}`);
        const resData: VehicleResponse[] = res.data;
        setLoading(false);
        if (resData.length < 1) {
          setSearchMessage("No result found.");
        }
        setVehicleFound(resData);
      } catch (e) {
        setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        setSearchMessage(error.message);
        searchForm.resetForm();
      }
    }
  });

  const onEdit = (vehicle) => {
    editVehicleConfig(vehicle);
    setVehicleFound([]);
    searchForm.resetForm();
  }

  const onClearAll = () => {
    setVehicleFound([]);
    setSearchMessage(initialSearchMessage);
    searchForm.resetForm();
  }

  return (
  <>
    <div className="w-12/12 sm:w-12/12 md:w-5/12 mt-12">
      <form onSubmit={searchForm.handleSubmit} className="flex flex-col justify-center">
        <div className="mb-5 flex">
          <SearchInput id="vehicle-search" name="keyword" placeholder="Search by vehicle's name" 
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
        {vehicleFound && vehicleFound.length > 0 && !isLoading ? (
        <>
          {vehicleFound.map((vehicle) => (
          <div key={vehicle.id} className="w-full">
            <div className="flex flex-col md:flex-row md:justify-between 
            p-6 bg-white rounded-box shadow-md mb-4 w-full">
              <div>
                <p className="font-medium">{vehicle.licensePlate}</p>
                <small className="text-sm text-gray-400">Nickname:</small>
                <p>{vehicle.nickname ? vehicle.nickname : "Unknown"}</p>
                <small className="text-sm text-gray-400">Volume:</small>
                <p>{vehicle.volume ? vehicle.volume : "Unknown"}</p>
                <small className="text-sm text-gray-400">Availability:</small>
                <p>{vehicle.available ? "Available" : "Not available"}</p>
                <small className="text-sm text-gray-400">Status:</small>
                <p>{vehicle.discontinued ? "Discontinued" : "In use"}</p>
              </div>

              <button className="btn btn-info text-blue-600 w-full md:w-fit mt-4 md:mt-0"
              onClick={() => onEdit(vehicle)}>
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