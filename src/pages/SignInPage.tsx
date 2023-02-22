import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "../commons/enums/role.enum";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import TextInput from "../components/forms/TextInput";
import { SignInResponse } from "../models/sign-in-response.model";
import api from "../stores/api";
import { useAuthStore } from "../stores/auth.store";

export default function SignInPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    error: "",
    loading: false,
  });
  const signIn = useAuthStore((state) => state.signIn);

  const signInForm = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit: async (data) => {
      setFormState((prev) => ({ ...prev, error: "", loading: true }));
      await api
        .post<SignInResponse>(`/auth/login`, data)
        .then((res) => {
          const resData: SignInResponse = res.data;
          signIn(resData);
          setFormState((prev) => ({ ...prev, error: "", loading: false }));
          signInForm.resetForm();
          if (resData.roleId === Role.MASTER || resData.roleId === Role.ADMIN) {
            navigate("/customer/draft-customer-order");
          } else if (resData.roleId === Role.OPERATOR) {
            navigate("/task/view-task");
          }
        })
        .catch((e) => {
          const error = JSON.parse(
            JSON.stringify(e.response ? e.response.data.error : e)
          );
          setFormState((prev) => ({
            ...prev,
            error: error.message,
            loading: false,
          }));
          signInForm.resetForm();
        });
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 p-4 dark:bg-base-100">
      <form onSubmit={signInForm.handleSubmit} className="custom-card">
        {formState.error ? (
          <div className="mb-5">
            <Alert message={formState.error} type="error"></Alert>
          </div>
        ) : null}
        <div className="mb-5">
          <label htmlFor="username" className="custom-label mb-2 inline-block">
            Username
          </label>
          <TextInput
            id="username"
            type="text"
            placeholder={`Username`}
            name="username"
            value={signInForm.values.username}
            onChange={signInForm.handleChange}
          ></TextInput>
        </div>
        <div className="mb-5">
          <label htmlFor="password" className="custom-label mb-2 inline-block">
            Password
          </label>
          <TextInput
            id="password"
            type="password"
            placeholder={`Password`}
            name="password"
            value={signInForm.values.password}
            onChange={signInForm.handleChange}
          ></TextInput>
        </div>
        <button
          type="submit"
          className="btn-primary btn mt-3 w-full"
          disabled={!!formState.loading}
        >
          Sign in
        </button>
      </form>
      {formState.loading ? (
        <div className="mt-5">
          <Spinner></Spinner>
        </div>
      ) : null}
    </div>
  );
}
