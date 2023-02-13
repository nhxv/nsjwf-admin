import { useNavigate } from "react-router-dom";
import { BiRightArrowAlt } from "react-icons/bi";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const onBack = () => {
    navigate("/sign-in");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 p-6">
      <h1 className="text-7xl font-bold">Error</h1>
      <p className="text-xl">This page does not exist.</p>
      <button className="btn-primary btn mt-4" onClick={onBack}>
        <span className="mr-1">Go to sign in</span>
        <BiRightArrowAlt className="h-6 w-6" />
      </button>
    </div>
  );
}
