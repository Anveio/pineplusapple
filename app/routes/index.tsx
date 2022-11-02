import { Link } from "@remix-run/react";
import { PageWrapper } from "~/components/PageWrapper";

import { useOptionalUser } from "~/shared";

export default function Index() {
  const user = useOptionalUser();
  return (
    <PageWrapper>
      <h2 className="text-center text-4xl">Home</h2>
      {user ? (
        <Link
          to={`/account/${user.id}`}
          className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
        >
          View Notes for {user.email}
        </Link>
      ) : null}
    </PageWrapper>
  );
}
