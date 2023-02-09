import { BiError, BiBot, BiCheckDouble } from "react-icons/bi";

export default function Alert({ message, type }) {
  if (type === "error") {
    return (    
      <div className="alert alert-error text-error-content justify-center">
        <div>
          <BiError className="w-6 h-6 md:mr-2"></BiError>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  if (type === "empty") {
    return (
      <div className="alert bg-base-300 justify-center">
        <div>
          <BiBot className="w-6 h-6"></BiBot>
          <span>{message}</span>
        </div>
      </div>
    );    
  }

  if (type === "success") {
    return (
      <div className="alert alert-success text-success-content justify-center">
        <div>
          <BiCheckDouble className="w-6 h-6"></BiCheckDouble>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  return null;
}