import create from "zustand";
import { FormType } from "../commons/form-type.enum";

interface CustomerConfigState {
  customer,
  formType: FormType,
  editCustomerConfig: (customer) => void,
  clearCustomerConfig: () => void,
}

export const useCustomerConfigStore = create<CustomerConfigState>((set) => ({
  customer: {
    id: 0, 
    name: "",
    address: "",
    phone: "",
    email: "",
    presentative: "", 
    discontinued: false
  },
  formType: FormType.CREATE,
  editCustomerConfig: (editedCustomer) => {
    set((state) => ({customer: {
      ...state.customer, 
      id: editedCustomer.id, 
      name: editedCustomer.name,
      address: editedCustomer.address,
      phone: editedCustomer.phone,
      email: editedCustomer.email,
      presentative: editedCustomer.presentative, 
      discontinued: editedCustomer.discontinued
    }}));
    set({formType: FormType.EDIT});
  },
  clearCustomerConfig: () => {
    set((state) => ({customer: {
      ...state.customer, 
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