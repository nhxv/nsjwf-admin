import { useState } from "react";
import { useFormik } from "formik";
import api from "../../../../stores/api";
import SearchInput from "../../../../components/forms/SearchInput";
import Spinner from "../../../../components/Spinner";
import { BiSearch, BiTrash, BiEdit } from "react-icons/bi";
import { useVehicleConfigStore } from "../../../../stores/vehicle-config.store";
import { VehicleResponse } from "../../../../models/vehicle-response.model";

export default function VehicleSearch() {
  const [searchState, setSearchState] = useState({
    greet: "Your search result will appear here.",
    error: "",
    empty: "",
    loading: false,
    found: [],
  });
  const editVehicleConfig = useVehicleConfigStore(
    (state) => state.editVehicleConfig
  );

  const searchForm = useFormik({
    initialValues: {
      keyword: "",
    },
    onSubmit: async (data) => {
      setSearchState((prev) => ({ ...prev, found: [], loading: true }));
      try {
        const res = await api.get(
          `/vehicles/basic-search?keyword=${data.keyword}`
        );
        const resData: VehicleResponse[] = res.data;
        if (resData.length < 1) {
          setSearchState((prev) => ({
            ...prev,
            greet: "",
            empty: "No result found.",
            loading: false,
          }));
        }
        setSearchState((prev) => ({ ...prev, loading: false, found: resData }));
      } catch (e) {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setSearchState((prev) => ({
          ...prev,
          greet: "",
          error: error.message,
          loading: false,
        }));
        searchForm.resetForm();
      }
    },
  });

  const onEdit = (vehicle) => {
    editVehicleConfig(vehicle);
    setSearchState((prev) => ({ ...prev, found: [] }));
    searchForm.resetForm();
  };

  const onClearAll = () => {
    setSearchState((prev) => ({
      ...prev,
      greet: "Your search result will appear here.",
      error: "",
      empty: "",
      loading: false,
      found: [],
    }));
    searchForm.resetForm();
  };

  return (
    <>
      <div className="mt-12 w-11/12 sm:w-6/12 md:w-5/12">
        <form
          onSubmit={searchForm.handleSubmit}
          className="flex flex-col justify-center"
        >
          <div className="mb-5 flex">
            <SearchInput
              id="vehicle-search"
              name="keyword"
              placeholder="Search by license plate"
              value={searchForm.values.keyword}
              onChange={searchForm.handleChange}
              onFocus={null}
              onClear={() => searchForm.setFieldValue("keyword", "")}
            />
            <button type="submit" className="btn btn-circle btn-accent ml-2">
              <BiSearch className="h-6 w-6"></BiSearch>
            </button>
          </div>
        </form>
      </div>
      <div className="mb-8 w-11/12 sm:w-6/12 md:w-5/12">
        <div className="flex flex-col items-center justify-center">
          {searchState.loading ? (
            <>
              <Spinner></Spinner>
            </>
          ) : (
            <>
              {searchState.found && searchState.found.length > 0 ? (
                <>
                  {searchState.found.map((vehicle) => (
                    <div key={vehicle.id} className="w-full">
                      <div
                        className="rounded-box mb-4 flex w-full 
              flex-col bg-base-100 p-6 shadow-md md:flex-row md:justify-between"
                      >
                        <div>
                          <p className="font-medium">{vehicle.licensePlate}</p>
                          <small className="text-sm text-gray-400">
                            Nickname:
                          </small>
                          <p>
                            {vehicle.nickname ? vehicle.nickname : "Unknown"}
                          </p>
                          <small className="text-sm text-gray-400">
                            Volume:
                          </small>
                          <p>{vehicle.volume ? vehicle.volume : "Unknown"}</p>
                          <small className="text-sm text-gray-400">
                            Availability:
                          </small>
                          <p>
                            {vehicle.available ? "Available" : "Not available"}
                          </p>
                          <small className="text-sm text-gray-400">
                            Status:
                          </small>
                          <p>
                            {vehicle.discontinued ? "Discontinued" : "In use"}
                          </p>
                        </div>

                        <button
                          className="btn btn-info mt-4 w-full text-primary md:mt-0 md:w-fit"
                          onClick={() => onEdit(vehicle)}
                        >
                          <BiEdit className="h-6 w-6"></BiEdit>
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4">
                    <button className="btn btn-accent" onClick={onClearAll}>
                      <span className="mr-2">Clear search result(s)</span>
                      <BiTrash className="h-6 w-6"></BiTrash>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {searchState.error ? (
                    <p className="text-neutral">{searchState.error}</p>
                  ) : (
                    <>
                      {searchState.empty ? (
                        <p className="text-neutral">{searchState.empty}</p>
                      ) : (
                        <>
                          {searchState.greet ? (
                            <p className="text-neutral">{searchState.greet}</p>
                          ) : null}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
