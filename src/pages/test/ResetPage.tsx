import api from "../../stores/api";
import { BiReset } from "react-icons/bi";
import { useState } from "react";

export default function ResetPage() {
  const [message, setMessage] = useState("");

  const onResetConfigure = async () => {
    setMessage("I've come to talk with you again...");
    try {
      const res = await api.delete(`/test/nuke/configure`);
      setTimeout(() => {
        setMessage("Done.");
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }, 2000);
    } catch (e) {
      const error = JSON.parse(
        JSON.stringify(e.response ? e.response.data.error : e)
      );
      setMessage(error.message);
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };

  const onResetOperation = async () => {
    setMessage("I've come to talk with you again...");
    try {
      const res = await api.delete(`/test/nuke/operation`);
      setTimeout(() => {
        setMessage("Done.");
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }, 2000);
    } catch (e) {
      const error = JSON.parse(
        JSON.stringify(e.response ? e.response.data.error : e)
      );
      setMessage(error.message);
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <h1 className="mb-8 text-xl font-bold">Version 1</h1>
      {message && (
        <div className="mockup-code mb-8 bg-black">
          <pre data-prefix=">" className="text-white">
            <code>{message}</code>
          </pre>
        </div>
      )}
      <div className="mb-8 flex flex-col items-center justify-center">
        <h2 className="font-medium underline underline-offset-4">Configure</h2>
        <button className="btn-secondary btn mt-4" onClick={onResetConfigure}>
          <span>Reset configured data</span>
          <BiReset className="ml-1 h-6 w-6"></BiReset>
        </button>
      </div>

      <div className="mb-8 flex flex-col items-center justify-center">
        <h2 className="font-medium underline underline-offset-4">Operation</h2>
        <button className="btn-secondary btn mt-4" onClick={onResetOperation}>
          <span>Reset operational data</span>
          <BiReset className="ml-1 h-6 w-6"></BiReset>
        </button>
      </div>
    </div>
  );
}
