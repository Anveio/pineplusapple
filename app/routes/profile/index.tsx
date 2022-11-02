import { useOptionalUser } from "~/shared";

export default function ProfilePage() {
  const user = useOptionalUser();

  return (
    <>
      <div>{user?.id}</div>
      <p>Your name</p>
    </>

  );
}
