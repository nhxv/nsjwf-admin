import  {create } from "zustand";
import { FormType } from "../commons/form-type.enum";

interface ProductConfigState {
  product,
  formType: FormType,
  editProductConfig: (product) => void,
  clearProductConfig: () => void,
}

export const useProductConfigStore = create<ProductConfigState>((set) => ({
  product: {id: 0, name: "", discontinued: false},
  formType: FormType.CREATE,
  editProductConfig: (editedProduct) => {
    set((state) => ({product: {
      ...state.product, 
      id: editedProduct.id, 
      name: editedProduct.name, 
      discontinued: editedProduct.discontinued
    }}));
    set({formType: FormType.EDIT});
  },
  clearProductConfig: () => {
    set((state) => ({product: {...state.product, id: 0, name: "", discontinued: false}}));
    set({formType: FormType.CREATE});
  }
}));