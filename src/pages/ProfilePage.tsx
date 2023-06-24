import { useAuthStore } from "../stores/auth.store";

export default function ProfilePage() {
  const nickname = useAuthStore((state) => JSON.parse(state.nickname));

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <p className="mt-2">Welcome, {nickname}.</p>
    </div>
  );
}
