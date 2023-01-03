import api from "../../stores/api";
import { BiReset } from "react-icons/bi";
import { useState } from "react";

export default function ResetPage() {
  const [message, setMessage] = useState("");

  const onResetConfigure = async () => {
    setMessage("I've come to talk with you again...");
    try {
      const res =  await api.delete(`/test/nuke/configure`);
      setTimeout(() => {
        setMessage("Done.");
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  }

  const onResetStock = async () => {
    setMessage("I've come to talk with you again...");
    try {
      const res =  await api.delete(`/test/nuke/stock`);
      setTimeout(() => {
        setMessage("Done.");
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }, 2000);
    } catch (e) {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      console.log(error.message);
      setMessage(error.message);
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  }

  return (
    <>
      <div className="flex flex-col items-center p-6 min-h-screen">
        <h1 className="font-bold text-xl mb-8">Version 1</h1>
        {message ? (
          <>
            <div className="mockup-code bg-gray-800 mb-8">
              <pre data-prefix=">" className="text-white"><code>{message}</code></pre>
            </div>
          </>
        ) : (<></>)}
        <div className="mb-8 flex flex-col justify-center items-center">
          <h2 className="font-medium underline underline-offset-4">Configure</h2>
          <button className="btn btn-secondary mt-4" onClick={onResetConfigure}>
            <span>Reset configured data</span>
            <BiReset className="w-6 h-6 ml-1"></BiReset>
          </button>
        </div>

        <div className="mb-8 flex flex-col justify-center items-center">
          <h2 className="font-medium underline underline-offset-4">Stock</h2>
          <button className="btn btn-secondary mt-4" onClick={onResetStock}>
            <span>Reset stock</span>
            <BiReset className="w-6 h-6 ml-1"></BiReset>
          </button>
        </div>

        <div className="mb-8 flex flex-col justify-center items-center">
          <h2 className="font-medium underline underline-offset-4">Order</h2>
          <p className="mt-2">(Nothing to click here.)</p>
        </div>

        <div className="mb-8 flex flex-col justify-center items-center">
          <h2 className="font-medium underline underline-offset-4">Return</h2>
          <p className="mt-2">(Nothing to click here.)</p>
        </div>
      </div>
    </>
    )
}