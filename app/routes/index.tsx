import { Link } from "@remix-run/react";
import { PageWrapper } from "~/components/PageWrapper";

import { useOptionalUser } from "~/shared";
import HomePageIcon from "../../assets/plantimage.svg"

export default function Index() {
  const user = useOptionalUser();
  return (
    <PageWrapper>
      <Link to="/">
        <h2 className="text-center text-4xl m-auto uppercase font-extralight tracking-tight">Pine + Apple</h2>
      </Link>

      <div className="flex flex-col items-center justify-center m-auto gap-4 max-w-[90%] mt-6">
        <span className="font-semibold text-xl text-center text-emerald-900">Affordable exotic plants at the reach of your hands</span>
        <img src={HomePageIcon} alt="" className="w-3/4 m-auto" />
        <span className="italic text-gray-500 font-light">We have shipped more than 500+ plants across 47 states in America. We take pride in our services and commitment to the plant community.</span>
        <Link to="/shop">
          <button className="primary-button">Brow Our Catalog</button>
        </Link>

      </div>
    </PageWrapper>
  );
}
