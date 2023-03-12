import { useAuthStore } from "../stores/auth.store";

export default function ProfilePage() {
  const nickname = useAuthStore((state) => JSON.parse(state.nickname));

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <h1 className="text-xl font-bold">Profile</h1>
      <p className="mt-2">Welcome, {nickname}.</p>
    </div>
  );
}
