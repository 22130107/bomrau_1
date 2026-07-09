import Link from "next/link";
import { getSession } from "@/lib/session";
import { HeaderClient } from "./HeaderClient";
import { LogoSwitcher } from "./LogoSwitcher";

export async function Header() {
  const session = await getSession();
  const isLoggedIn = !!session;
  const displayName = session?.displayName || session?.username;
  const username = displayName;
  const role = session?.role;

  const dashboardHref = role === "admin" ? "/admin" : role === "npp" ? "/npp" : null;

  return (
    <header className="border-b fixed w-full left-0 top-0 bg-[rgb(15,23,42)] z-[2506] border-b-[rgba(254,226,226,0.5)]">
      <div className="mx-auto w-full max-w-[1200px] px-[14px]">
        <div className="items-center flex w-full h-[60px] md:h-[80px] justify-between gap-[8px] md:gap-[20px]">
          <h1 className="self-center font-bold relative w-[70px] md:w-[100px] shrink-0">
            <Link href="/" className="block">
              <LogoSwitcher className="block w-full" priority />
            </Link>
          </h1>

          <HeaderClient
            isLoggedIn={isLoggedIn}
            username={username}
            role={role}
            dashboardHref={dashboardHref}
          />
        </div>
      </div>
    </header>
  );
}
