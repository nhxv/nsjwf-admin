import { useState } from "react";
import { BiError } from "react-icons/bi";
import TextInput from "../components/forms/TextInput";
import Spinner from "../components/Spinner";
import { useFormik } from "formik";
import { SignInResponse } from "../models/sign-in-response.model";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import api from "../stores/api";
import { Role } from "../commons/role.enum";

export default function SignInPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    error: "",
    loading: false,
  });
  const signIn = useAuthStore((state) => state.signIn);
  const role = useAuthStore(state => state.role);

  const signInForm = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit: async (data) => {
      setFormState(prev => ({...prev, loading: true}));
      await api.post<SignInResponse>(`/auth/login`, data)
      .then((res) => {
        const resData: SignInResponse = res.data;
        signIn(resData);
        setFormState(prev => ({...prev, loading: false}));
        signInForm.resetForm();
        if (resData.roleId === Role.MASTER || resData.roleId === Role.ADMIN) {
          navigate("/customer/draft-customer-order");
        } else if (resData.roleId === Role.OPERATOR) {
          navigate("/task/view-task");
        }
      })
      .catch(e => {
        const error = JSON.parse(JSON.stringify(
          e.response ? e.response.data.error : e
        ));
        setFormState(prev => ({...prev, error: error.message, loading: false}));
        signInForm.resetForm();
      });
    }
  });

  return (
    <>
      <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-gray-200">
        <form onSubmit={signInForm.handleSubmit} className="max-w-5/12 bg-base-100 p-6 rounded-box shadow-md">
          {formState.error ? (
          <div className="alert alert-error text-red-700 mb-5">
            <div>
              <BiError className="flex-shrink-0 h-6 w-6"></BiError>
              <span>{formState.error}</span>
            </div>
          </div>
          )  : <></>}
          <div className="mb-5">
            <label htmlFor="username" className="custom-label inline-block mb-2">Username</label>
            <TextInput id="username" name="username" type="text" placeholder={`Username`} 
            value={signInForm.values.username} 
            onChange={signInForm.handleChange}
            ></TextInput>
          </div>
          <div className="my-5">
            <label htmlFor="password" className="custom-label inline-block mb-2">Password</label>
            <TextInput id="password" type="password" name="password" placeholder={`Password`}
            value={signInForm.values.password} 
            onChange={signInForm.handleChange}
            ></TextInput>
          </div>
          <button type="submit" className="btn btn-primary text-white w-full mt-3">Sign in</button>
        </form>
        {formState.loading ? (
        <>
          <div className="mt-4">
            <Spinner></Spinner>
          </div>
        </>
        ) : <></>}
      </div>
    </>
  )
}