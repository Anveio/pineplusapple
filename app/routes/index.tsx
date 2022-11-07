import { Link } from "@remix-run/react";
import { PageWrapper } from "~/components/PageWrapper";

import {
  HEADER_TEXT_COLOR_CLASSNAMES,
  PRIMARY_BUTTON_CLASSNAMES,
  TopLevelRoute,
} from "~/shared";

import Thumb1 from "~/assets/img/headerthumb1.jpg";
import Thumb2 from "~/assets/img/headerthumb2.webp";
import Thumb3 from "~/assets/img/headerthumb3.webp";
import Thumb4 from "~/assets/img/headerthumb4.webp";

export default function Index() {
  return (
    <PageWrapper title="Pine + Apple">
      <div className="grid gap-4">
        <div className="relative grid grid-cols-3 gap-4">
          <div className="relative col-span-2 h-full object-cover">
            <img
              src={Thumb1}
              className="h-full w-full rounded-2xl object-cover"
              alt=""
            />
            <div className="absolute top-0 col-span-1 grid h-full w-full  place-content-center ">
              <span className=" bg-white p-2 text-center text-xl font-medium italic sm:p-4 sm:text-4xl ">
                Exotic Plants
              </span>
            </div>
          </div>
          <div className="relative col-span-1 h-full object-cover">
            <img
              src={Thumb2}
              className="h-full rounded-2xl bg-cover object-cover"
              alt=""
            />
            <div className="absolute top-0 col-span-1 grid h-full w-full  place-content-center ">
              <span className=" text-l bg-white py-2 px-1 text-center font-medium italic sm:p-4 sm:text-4xl">
                Ethically Sourced
              </span>
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          <div className="relative col-span-1 h-full object-cover">
            <img
              src={Thumb1}
              className="h-full w-full rounded-2xl object-cover"
              alt=""
            />
            <div className="absolute top-0 col-span-1 grid h-full w-full  place-content-center  p-5">
              <span className=" bg-white p-2 text-center text-xl font-medium italic sm:p-4 sm:text-4xl">
                Seattle Raised
              </span>
            </div>
          </div>
          <div className="relative col-span-2 h-full object-cover">
            <img
              src={Thumb4}
              className="h-full w-full rounded-2xl bg-cover object-cover"
              alt=""
            />
            <div className="absolute top-0 col-span-1 grid h-full w-full  place-content-center ">
              <Link
                to={"/" + TopLevelRoute.Store}
                className=" rounded-lg border border-terracotta-sanmarino bg-terracotta-goldengrass p-2 text-center text-xl font-medium italic text-terracotta-konbu underline sm:p-4 sm:text-4xl "
              >
                Start shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
