import { useNavigate } from "react-router-dom";
import { BiRightArrowAlt } from "react-icons/bi";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const onBack = () => {
    navigate("/sign-in");
  }

  return (
  <>
  <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-base-200">
    <h1 className="font-bold text-7xl">Error</h1>
    <p className="text-xl">This page does not exist.</p>
    <button className="btn btn-primary text-white mt-4" onClick={onBack}>
      <span className="mr-1">Go to sign in</span> 
      <BiRightArrowAlt className="w-6 h-6" />
    </button>
  </div>
  </>
  )
}