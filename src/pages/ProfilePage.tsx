import { useAuthStore } from "../stores/auth.store";

export default function ProfilePage() {
  const nickname = useAuthStore((state) => JSON.parse(state.nickname));

  const testPrettier = () => {
    for (let i = 0; i < 4; i++) {
      console.log("bullshit");
      const obj = { id: 1, name: "", bs: 3 };
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <h1 className="text-xl font-bold">Profile</h1>
      <p className="mt-2">Welcome, {nickname}.</p>
    </div>
  );
}
