import create from "zustand";
import { FormType } from "../commons/form-type.enum";

interface VendorConfigState {
  vendor,
  formType: FormType,
  editVendorConfig: (vendor) => void,
  clearVendorConfig: () => void,
}

export const useVendorConfigStore = create<VendorConfigState>((set) => ({
  vendor: {
    id: 0, 
    name: "",
    address: "",
    phone: "",
    email: "",
    presentative: "", 
    discontinued: false
  },
  formType: FormType.CREATE,
  editVendorConfig: (editedVendor) => {
    set((state) => ({vendor: {
      ...state.vendor, 
      id: editedVendor.id, 
      name: editedVendor.name,
      address: editedVendor.address,
      phone: editedVendor.phone,
      email: editedVendor.email,
      presentative: editedVendor.presentative, 
      discontinued: editedVendor.discontinued,
    }}));
    set({formType: FormType.EDIT});
  },
  clearVendorConfig: () => {
    set((state) => ({vendor: {
      ...state.vendor, 
      id: 0,
      name: "", 
      address: "",
      phone: "",
      email: "",
      presentative: "", 
      discontinued: false
    }}));
    set({formType: FormType.CREATE});
  }
}));