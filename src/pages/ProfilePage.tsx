import { useAuthStore } from "../stores/auth.store";

export default function ProfilePage() {
  const nickname = useAuthStore((state) => JSON.parse(state.nickname));

  const calcDayOfYear = (date: Date) => {
    // https://stackoverflow.com/a/40975730
    return (
      (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
        Date.UTC(date.getFullYear(), 0, 0)) /
      24 /
      60 /
      60 /
      1000
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <p className="mt-2">Welcome, {nickname}.</p>
      <p>
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "2-digit",
        })}
      </p>
      <p>Day {calcDayOfYear(new Date())}</p>
    </div>
  );
}
