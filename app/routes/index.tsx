import { Link } from "@remix-run/react";
import { PageWrapper } from "~/components/PageWrapper";

import { PRIMARY_BUTTON_TEXT_CLASSNAMES, TopLevelRoute } from "~/shared";
import HomePageIcon from "../../assets/plantimage.svg";

export default function Index() {
  return (
    <PageWrapper>
      <div className="m-auto mt-6 flex max-w-[90%] flex-col items-center justify-center gap-4">
      <Link to="/">
        <h2 className="m-auto text-center text-4xl font-extralight uppercase tracking-tight">
          Pine + Apple
        </h2>
      </Link>
        <div className="relative m-auto mt-6 flex max-w-[90%] flex-col items-center justify-center gap-5">
          <span className="text-center text-2xl font-semibold text-emerald-900 dark:text-lime-200">
            Ethically sourced exotic plants at affordable prices
          </span>
          <img src={HomePageIcon} alt="" className="m-auto w-3/4" />
          <span className="text-lg font-light italic">
            We have shipped more than 500+ plants across 47 states in America.
            We take pride in our services and commitment to the plant community.
          </span>
        </div>
        <div className="sticky grid w-full place-content-center ">
          <Link to={"/" + TopLevelRoute.Shop}>
            <button
              className={
                "primary-button text-l rounded-full bg-emerald-900 py-4 px-6 hover:bg-emerald-600 focus:bg-emerald-600" +
                PRIMARY_BUTTON_TEXT_CLASSNAMES
              }
            >
              Start shopping
            </button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
