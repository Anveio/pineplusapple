import { Link } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/server-runtime";
import { PageWrapper } from "~/components/PageWrapper";

import { PRIMARY_BUTTON_TEXT_CLASSNAMES, TopLevelRoute } from "~/shared";
import HomePageIcon from "../../assets/plantimage.svg";
import IndexStyle from "../styles/index.css"
import ThaiGrowerImage from "../../assets/thai1.jpg"
import ThaiGrowerImage2 from "../../assets/thai2.jpg"
import React from "react";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: IndexStyle }]
}

const ImageUrlsArray = ["../../assets/home1.jpg", "../../assets/home2.jpg", "../../assets/home3.jpg", "../../assets/home4.jpg"]

export default function Index() {
  const [imageBgUrl, setImageBgUrl] = React.useState(ImageUrlsArray[1]);

  // TODO: Make changing image random works
  function changeBg() {
    const bgUrl = ImageUrlsArray[Math.floor(Math.random() * ImageUrlsArray.length)]
    setImageBgUrl(bgUrl)
    console.log(imageBgUrl)
  }

  const interval = setInterval(changeBg, 1000)
  clearInterval(interval)

  return (
    <div>
      <Link to="/">
        <h2 className="mx-auto my-3 text-center text-4xl font-extralight uppercase tracking-tight">
          Pine + Apple
        </h2>
      </Link>
      <div className="HomePage__TopSection m-auto mt-2 flex px-[5%] flex-col items-center justify-center gap-4 bg-cover" style={{ backgroundImage: `url(${imageBgUrl})` }} >
        <div className="frosted-glass relative m-auto my-10 flex max-w-[90%] flex-col items-center justify-center gap-5 p-5">
          <span className="text-center text-2xl font-semibold text-black dark:text-lime-200">
            Ethically sourced exotic plants at affordable prices
          </span>
          <img src={HomePageIcon} alt="" className="m-auto w-3/4" />
          <span className="text-base font-light italic text-white">
            We have shipped more than 500+ plants across 47 states in America.
            We take pride in our services and commitment to the plant community.
          </span>
          <div className="sticky grid w-full place-content-center">
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
      </div>
      <PageWrapper>
        <OurValues />
      </PageWrapper>
    </div>
  );
}



const OurValues = () => {
  return (
    <div className="text-black mt-2 flex flex-col items-center gap-3 font-light">
      <div className="bg-gray-200 w-full rounded-2xl p-5 flex flex-col gap-1">
        <span className="font-normal text-2xl">Our Story</span>
        <span >We are first-generation Asian immigrants whose goal is to bring rare tropical plants from Asia to America. We build connections with native South East Asian growers in more than 5 different countries to bring exotic plants to America at an afforable price.</span>
        <img src={ThaiGrowerImage2} alt="" className="w-[100%] mx-auto my-3 rounded" />
      </div>
      <div className="bg-slate-200 w-full rounded-lg p-5 flex flex-col gap-1">
        <span className="font-normal text-2xl">Our Mission</span>
        <span>We are a licensed plant distributor in Seattle, Washington. Together we have helped bring over 500+ plants to plant lovers all around the United States. We take pride in our services and passion and we continue to provide the best service we could to make your shopping experience as perfect as it could be.</span>
      </div>
      <div className="bg-gray-200 w-full rounded-lg p-5 flex flex-col gap-1">
        <span className="font-normal text-2xl">Our Values</span>
        <ul className="list-disc">
          <li className="ml-5">We are authentic and honest. No hidden fees, no false advertisement. All plants are described as detailed as we can.</li>
          <li className="ml-5">We are ethical with our sources and business. By purchasing from us you are directly helping native growers in Asia. We stand against plant-flipping and we make sure are of our plants are cared for and fully acclimated to greenhouse conditions before shipping them to our customers.</li>
          <img src={ThaiGrowerImage} alt="" className="w-[90%] mx-auto my-3 rounded" />
          <li className="ml-5">We values our environment by using recycled materials to pack your orders. A small amount of every order goes to World wide Fund for Nature to help improve mother nature's environment.</li>
        </ul>
      </div>
    </div>
  )
}