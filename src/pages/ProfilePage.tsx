import { useAuthStore } from "../stores/auth.store";


export default function ProfilePage() {
  const username = useAuthStore((state) => JSON.parse(state.username));

  return (
    <>
      <div className="flex flex-col items-center p-6 min-h-screen">
        <h1 className="font-bold text-xl">Profile</h1>
        <p className="mt-2">Welcome, {username}.</p>
      </div>
    </>
    )
}