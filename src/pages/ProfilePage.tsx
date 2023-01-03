import { useAuthStore } from "../stores/auth.store";
import Select from "../components/forms/SelectInput";


export default function ProfilePage() {
  const nickname = useAuthStore((state) => JSON.parse(state.nickname));

  return (
    <>
      <div className="flex flex-col items-center p-6 min-h-screen">
        <h1 className="font-bold text-xl">Profile</h1>
        <p className="mt-2">Welcome, {nickname}.</p>
      </div>
    </>
    )
}