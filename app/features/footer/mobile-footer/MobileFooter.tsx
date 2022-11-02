import * as React from "react";
import { InstagramLogo, Storefront } from "phosphor-react"

const MobileFooter: React.FC = () => {


    return (
        <div className="px-[10%] py-6 bg-emerald-900 text-white font-light text-sm flex flex-col gap-5 mb-20">
            <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col">
                    <span className="font-bold mb-1">Helpful Links</span>
                    <span className="hover:text-emerald-400">FAQ</span>
                    <span className="hover:text-emerald-400">Common Issues</span>
                    <span className="hover:text-emerald-400">Shipping & Returns</span>
                    <span className="hover:text-emerald-400">Refer a Friend</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold mb-1">Company</span>
                    <span className="hover:text-emerald-400">Our Story</span>
                    <span className="hover:text-emerald-400">Contact Us</span>
                    <span className="hover:text-emerald-400">Plant Care Blog</span>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <span className="font-bold mb-1">Compliance</span>
                <span className="hover:text-emerald-400">Accessibility Statement</span>
                <span className="hover:text-emerald-400">Privacy Policy</span>
                <span className="hover:text-emerald-400">Terms of Use</span>
            </div>
            <div className="flex flex-row gap-6">
                <span className="font-bold mb-1">Connect with us</span>
                <div className="flex flex-row items-center gap-2"><a href="https://www.instagram.com" target={"_blank"} rel="noreferrer"><InstagramLogo size={24} className="hover:text-emerald-400" /></a>
                    <a href="blossm"><Storefront size={24} className="hover:text-emerald-400" /></a>
                </div>
            </div>
            <hr></hr>
            <span className="flex flex-col gap-1 pt-2 pb-5 text-xs justify-between">
                <span>Pine + Apple © 2022 All Rights Reserved</span>
                <span>Seattle, WA 98101, USA</span>
            </span>
        </div>
    );
};



export { MobileFooter };
