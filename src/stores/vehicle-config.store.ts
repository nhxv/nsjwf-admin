import  { create } from "zustand";
import { FormType } from "../commons/form-type.enum";

interface VehicleConfigState {
  vehicle,
  formType: FormType,
  editVehicleConfig: (vehicle) => void,
  clearVehicleConfig: () => void,
}

export const useVehicleConfigStore = create<VehicleConfigState>((set) => ({
  vehicle: {
    id: 0, 
    licensePlate: "",
    available: true,
    discontinued: false,
    nickname: "",
    volume: 0,
  },
  formType: FormType.CREATE,
  editVehicleConfig: (editedVehicle) => {
    set((state) => ({vehicle: {
      ...state.vehicle,
      id: editedVehicle.id, 
      licensePlate: editedVehicle.licensePlate, 
      available: editedVehicle.available,
      discontinued: editedVehicle.discontinued,
      nickname: editedVehicle.nickname,
      volume: editedVehicle.volume,
    }}));
    set({formType: FormType.EDIT});
  },
  clearVehicleConfig: () => {
    set((state) => ({vehicle: {
      ...state.vehicle, 
      id: 0, 
      licensePlate: "",
      available: true,
      discontinued: false,
      nickname: "",
      volume: 0,
    }}));
    set({formType: FormType.CREATE});
  }
}));