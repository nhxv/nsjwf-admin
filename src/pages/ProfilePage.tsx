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
    <div className="flex flex-col items-center p-6 min-h-screen">
      <h1 className="font-bold text-xl">Profile</h1>
      <p className="mt-2">Welcome, {nickname}.</p>
    </div>
  );
}
