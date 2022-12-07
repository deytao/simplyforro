import { Footer } from "flowbite-react";
import moment from "moment";
import { BsFacebook, BsInstagram } from 'react-icons/bs';
import { Navbar } from "components/Navbar";

export default function Layout({ children }) {
    return (
        <>
            <Navbar />
            <main className="flex min-h-screen flex-col items-center">{children}</main>
            <Footer container={true} className="flex justify-between">
                <Footer.Copyright href="/" by="SimplyForró" year={moment().format("YYYY")} />
                <div className="flex justify-center gap-2">
                    <Footer.Icon
                      href="https://www.facebook.com/groups/401383903898367/"
                      icon={BsFacebook}
                    />
                    <Footer.Icon
                      href="https://www.instagram.com/simplyforro/"
                      icon={BsInstagram}
                    />
                </div>
            </Footer>
        </>
    );
}
