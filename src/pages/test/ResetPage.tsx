import api from "../../stores/api";
import { BiReset } from "react-icons/bi";
import { useState } from "react";

export default function ResetPage() {
  const [message, setMessage] = useState("");

  const onReset = async () => {
    setMessage("I've come to talk with you again...");
    setTimeout(async () => {
      try {
        const res =  await api.delete(`/test/nuke/configure`);
        setMessage("Done.");
        setTimeout(() => {
          setMessage("");
        }, 2000);
      } catch (error) {
        console.log(error);
      }
    }, 2000)

  }

  return (
    <>
      <div className="flex flex-col items-center p-6 min-h-screen">
        <h1 className="font-bold text-xl">Version 1</h1>
        <div className="mt-8 flex flex-col justify-center items-center">
          <h2 className="font-medium underline underline-offset-4">Configure</h2>
          <button className="btn btn-secondary text-white mt-4" onClick={onReset}>
            <span>Reset configured data</span>
            <BiReset className="w-6 h-6 ml-1"></BiReset>
          </button>
          {message ? (
          <>
            <div className="mockup-code bg-gray-800 mt-8">
              <pre data-prefix=">" className="text-white"><code>{message}</code></pre>
            </div>
          </>
          ) : (<></>)}
        </div>

        <div className="mt-8 flex flex-col justify-center items-center">
          <h2 className="font-medium underline underline-offset-4">Stock</h2>
          <p className="mt-4">(Incoming)</p>
        </div>
      </div>
    </>
    )
}