import { Link } from "@remix-run/react";
import { PageWrapper } from "~/components/PageWrapper";

import { PRIMARY_BUTTON_TEXT_CLASSNAMES, TopLevelRoute } from "~/shared";
import HomePageIcon from "../../assets/plantimage.svg";

export default function Index() {
  return (
    <PageWrapper>
      <Link to="/">
        <h2 className="m-auto text-center text-4xl font-extralight uppercase tracking-tight">
          Pine + Apple
        </h2>
      </Link>

      <div className="m-auto mt-6 flex max-w-[90%] flex-col items-center justify-center gap-4">
        K
        <h2 className="m-auto text-center text-4xl font-extralight uppercase tracking-tight transition-colors">
          Pine + Apple
        </h2>
        <div className="relative m-auto mt-6 flex max-w-[90%] flex-col items-center justify-center gap-5">
          <span className="text-center text-2xl font-semibold text-emerald-900 dark:text-lime-200">
            Exotic plants: ethically sourced and extra-affordable
          </span>
          <img src={HomePageIcon} alt="" className="m-auto w-3/4" />
          <span className="text-lg font-light italic">
            We have shipped more than 500+ plants across 47 states in America.
            We take pride in our services and commitment to the plant community.
          </span>
        </div>
        <div className="sticky grid w-full place-content-center ">
          <Link to={"/" + TopLevelRoute.Store}>
            <button
              className={
                "primary-button text-l rounded bg-blue-500 py-4 px-6 hover:bg-blue-600 focus:bg-blue-400" +
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
