import { Link } from "@remix-run/react";
import { PageWrapper } from "~/components/PageWrapper";

import {
  HEADER_TEXT_COLOR_CLASSNAMES,
  PRIMARY_BUTTON_CLASSNAMES,
  TopLevelRoute,
} from "~/shared";

export default function Index() {
  return (
    <PageWrapper>
      <div className="grid-auto-rows grid grid-cols-1 gap-5">
        <div className="grid grid-cols-9">
          <p className="col-span-4 text-left text-4xl font-light">Pine</p>
          <p className="text-4xl font-light">+</p>
          <p className="col-span-4 text-right text-4xl font-light">Apple</p>
        </div>
        <img
          className="place-self-center"
          src="https://via.placeholder.com/300"
          alt=""
        ></img>
        <div className="grid grid-cols-9">
          <p className={"col-span-6 text-2xl " + HEADER_TEXT_COLOR_CLASSNAMES}>
            Exotic plants, ethically sourced
          </p>
        </div>
        <p className="text-lg font-light">
          Stop sending your hard-earned money to sellers who exploit their
          growers or overcharge their customers.
        </p>
        <p className="text-lg font-light">
          Pine + Apple works directly with growers in South East Asia to import
          rare plants that can't be sourced from anywhere else.
        </p>
        <p className="text-lg font-light ">
          Our company is headed and staffed by first-generation Asian immigrants
          and the money we make from your purchase gets re-invested directly
          into the growers that nursed your plant.
        </p>
        <img
          className="place-self-center"
          src="https://via.placeholder.com/300"
          alt=""
        ></img>
        <p className="text-lg font-light ">
          The plants in our shop get acclimatized in our nursery in rainy
          Seattle, Washington until they're ready to be shipped to your door.
        </p>
        <div className="grid grid-cols-9">
          <p className={"col-span-6 text-2xl " + HEADER_TEXT_COLOR_CLASSNAMES}>
            Nature is priceless
          </p>
        </div>
        <p className="text-lg font-light">
          Mother Nature never asked anyone for money, so why do exotic plants
          cost so much?
        </p>
        <p className="text-lg font-light">
          We carefully select our prices to cover the cost of fairly
          compensating the farmers we partner with, shipping, and nursery. We
          offer the best prices in the market because we work directly with
          farmers and sell directly to you. No third-parties. No exploitation.
        </p>
        <div className="grid grid-cols-9">
          <p className={"col-span-6 text-2xl " + HEADER_TEXT_COLOR_CLASSNAMES}>
            Trusted and reliable
          </p>
        </div>
        <span className="text-lg font-light italic">
          We have shipped more than 500+ plants across 47 states in America. We
          take pride in our services and commitment to the plant community.
        </span>
      </div>
      <div className="sticky grid w-full place-content-center ">
        <Link to={"/" + TopLevelRoute.Store}>
          <button className={PRIMARY_BUTTON_CLASSNAMES}>Start shopping</button>
        </Link>
      </div>
    </PageWrapper>
  );
}
