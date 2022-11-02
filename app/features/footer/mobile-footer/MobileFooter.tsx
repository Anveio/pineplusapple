import * as React from "react";
import { InstagramLogo, Storefront } from "phosphor-react"

const MobileFooter: React.FC = () => {


    return (
        <div className="px-[10%] py-6 bg-emerald-900 text-white font-light text-sm flex flex-col gap-5 mb-20">
            <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col">
                    <span className="font-bold mb-1">Helpful Links</span>
                    <span>FAQ</span>
                    <span>Common Issues</span>
                    <span>Shipping & Returns</span>
                    <span>Refer a Friend</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold mb-1">Company</span>
                    <span>Our Story</span>
                    <span>Contact Us</span>
                    <span>Plant Care Blog</span>
                </div>
            </div>
            <div className="flex flex-col">
                <span className="font-bold mb-1">Compliance</span>
                <span>Accessibility Statement</span>
                <span>Privacy Policy</span>
                <span>Terms of Use</span>
            </div>
            <hr></hr>
            <div className="flex flex-row gap-6">
                <span>Connect with us</span>
                <div className="flex flex-row items-center gap-2"><a href="https://www.instagram.com" target={"_blank"} rel="noreferrer"><InstagramLogo size={24} className="hover:text-emerald-400" /></a>
                    <a href="blossm"><Storefront size={24} className="hover:text-emerald-400" /></a>
                </div>
            </div>
        </div>
    );
};



export { MobileFooter };
