import { BiError, BiBot, BiCheckDouble } from "react-icons/bi";
import { getApiError } from "../stores/api";

interface IAlertFromQueryErrorProps {
  queryError: any;
}

export default function Alert({ message, type }) {
  if (type === "error") {
    return (
      <div className="alert alert-error justify-center text-error-content">
        <div>
          <BiError className="h-6 w-6"></BiError>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  if (type === "warning" || type === "warn") {
    return (
      <div className="alert alert-warning justify-center text-warning-content">
        <div>
          <BiError className="h-6 w-6"></BiError>
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

export function AlertFromQueryError({ queryError }: IAlertFromQueryErrorProps) {
  // BUG: Revisit code that use this since it'll also check for a paused fetchStatus
  // and for networking issue, it's not clear whether query.error/queryError exist or not.
  return <Alert type="error" message={getApiError(queryError).message}></Alert>;
}
