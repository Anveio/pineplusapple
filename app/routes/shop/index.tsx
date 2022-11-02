import { PageWrapper } from "~/components/PageWrapper";
import { useOptionalUser } from "~/shared";

export default function Shop() {
  const user = useOptionalUser();

  return (
    <PageWrapper>
      <h2 className="text-center text-4xl">Our Plants</h2>

      {user ? (<div>Show all plants</div>) : (<div></div>)}
    </PageWrapper>
  );
}
