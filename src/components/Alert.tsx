import { BiError, BiBot, BiCheckDouble } from "react-icons/bi";

export default function Alert({ message, type }) {
  return (
  <>
    {type === "error" ? (
    <div className="alert alert-error text-error-content flex justify-center gap-0">
      <BiError className="w-6 h-6 md:mr-2"></BiError>
      <span>{message}</span>
    </div>
    ) : (
    <>
      {type === "empty" ? (
      <div className="alert bg-base-300 flex justify-center">
        <BiBot className="md:mr-2 w-6 h-6"></BiBot>
        <span>{message}</span>
      </div>
      ): (
      <>
        {type === "success" ? (
        <div className="alert alert-success text-success-content flex justify-center">
          <BiCheckDouble className="md:mr-2 w-6 h-6"></BiCheckDouble>
          <span>{message}</span>
        </div>
        ) : (<></>)}
      </>
      )}
    </>
    )}
  </>
  )
}