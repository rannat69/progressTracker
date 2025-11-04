import { useRouter } from "next/navigation";

export function LogOut() {
  const router = useRouter();
  const handleLogOut = () => {
    router.push(`/`);
    sessionStorage.removeItem("sessionId");
  };

  return (
    <div className="p-3 flex flex-col">
      <h1>Are you sure you want to log out?</h1>
      <button className="button w-1/4" onClick={() => handleLogOut()}>Yes</button>
    </div>
  );
}
