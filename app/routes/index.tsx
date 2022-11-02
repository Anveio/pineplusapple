import { Link } from "@remix-run/react";
import { PageWrapper } from "~/components/PageWrapper";

import { useOptionalUser } from "~/shared";
import HomePageIcon from "../../assets/plantimage.svg"

export default function Index() {
  const user = useOptionalUser();
  return (
    <PageWrapper>
      <h2 className="text-center text-4xl m-auto uppercase font-extralight tracking-tight">Pine + Apple</h2>
      {/* {user ? (
        <Link
          to={`/account/${user.id}`}
          className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
        >
          View Notes for {user.email}
        </Link>
      ) : null} */}
      <div className="flex flex-col items-center justify-center m-auto gap-5 max-w-[90%] mt-6">
        <span className="font-semibold text-2xl text-center text-emerald-900">Affordable exotic plants at the reach of your hands</span>
        <img src={HomePageIcon} alt="" className="w-3/4 m-auto" />
        <span className="italic text-gray-500 font-light">We have shipped more than 500+ plants across 47 states in America. We take pride in our services and commitment to the plant community.</span>
        <button className="primary-button">Brow Our Catalog</button>
      </div>
    </PageWrapper>
  );
}
