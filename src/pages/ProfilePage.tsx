import { useAuthStore } from "../stores/auth.store"

export default function ProfilePage() {
  const username = useAuthStore((state) => state.username);

  return (
    <>
      <div className="flex flex-col items-center p-6 min-h-screen">
        <h1 className="font-bold text-xl">Profile</h1>
        <p>You're currently signed in as: {username}</p>
      </div>
    </>
    )
}