import { BiError, BiBot, BiCheckDouble } from "react-icons/bi";

export default function Alert({ message, type }) {
  if (type === "error") {
    return (
      <div className="alert alert-error justify-center text-error-content">
        <div>
          <BiError className="h-6 w-6 md:mr-2"></BiError>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  if (type === "empty") {
    return (
      <div className="alert justify-center bg-base-300">
        <div>
          <BiBot className="h-6 w-6"></BiBot>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  if (type === "success") {
    return (
      <div className="alert alert-success justify-center text-success-content">
        <div>
          <BiCheckDouble className="h-6 w-6"></BiCheckDouble>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  return null;
}
