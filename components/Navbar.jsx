'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { HeartIcon, MenuIcon, PackageIcon, Search, ShoppingCart, XIcon } from "lucide-react";
import { useUser, useClerk, UserButton, Protect } from "@clerk/nextjs";

const MOBILE_MENU_CLOSE_DELAY = 280;

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const cartCount = useSelector((state) => state.cart.total);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);

  const navLinks = [
    { href: "/", label: "Trang Chủ", match: (path) => path === "/" },
    { href: "/shop", label: "Sản Phẩm", match: (path) => path.startsWith("/shop") || path.startsWith("/product") },
    { href: "/store", label: "Cửa Hàng", match: (path) => path.startsWith("/store") },
    { href: "/admin", label: "Admin", match: (path) => path.startsWith("/admin") },
  ];

  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuVisible(true);
      return;
    }

    const timeout = setTimeout(() => {
      setMobileMenuVisible(false);
    }, MOBILE_MENU_CLOSE_DELAY);

    return () => clearTimeout(timeout);
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuVisible) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileMenuOpen ? "hidden" : originalOverflow;

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen, mobileMenuVisible]);

  const getNavLinkClass = (isActive) =>
    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
      isActive
        ? "bg-green-500 text-white shadow-sm"
        : "text-slate-600 hover:bg-green-50 hover:text-green-700"
    }`;

  const getUtilityLinkClass = (isActive) =>
    `relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-green-50 text-green-700"
        : "text-slate-600 hover:bg-green-50 hover:text-green-700"
    }`;

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
    setMobileMenuOpen(false);
  };

  const MobileLink = ({ href, label, isActive, delay = 0 }) => (
    <Link
      href={href}
      className={`mobile-menu-item rounded-2xl px-4 py-3 text-sm font-medium transition ${
        isActive
          ? "bg-green-500 text-white"
          : "bg-slate-50 text-slate-700 hover:bg-green-50 hover:text-green-700"
      } ${mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      style={{ transitionDelay: mobileMenuOpen ? `${delay}ms` : "0ms" }}
    >
      {label}
    </Link>
  );

  return (
    <nav className="relative z-40 bg-white">
      {mobileMenuVisible && (
        <button
          type="button"
          aria-label="Close mobile menu overlay"
          onClick={() => setMobileMenuOpen(false)}
          className={`fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[2px] transition-all duration-300 sm:hidden ${
            mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      )}

      <div className="relative z-40 mx-4 sm:mx-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-4 transition-all">
          <Link href="/" className="relative shrink-0 text-2xl font-semibold text-slate-700 sm:text-3xl lg:text-4xl">
            <span className="text-green-600">Bến Quê </span>
            Market
            <span className="text-5xl leading-0 text-green-600">.</span>
            <Protect plan="plus">
              <p className="absolute -right-8 -top-1 flex items-center gap-2 rounded-full bg-green-500 px-3 py-0.5 text-xs font-semibold text-white">
                Plus
              </p>
            </Protect>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 text-slate-600 sm:flex xl:gap-3">
            <div className="flex shrink-0 items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={getNavLinkClass(link.match(pathname))}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <form onSubmit={handleSearch} className="hidden min-w-[180px] max-w-[220px] flex-1 items-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm xl:flex 2xl:max-w-xs">
              <Search size={18} className="shrink-0 text-slate-600" />
              <input
                className="w-full min-w-0 bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder="Tìm kiếm sản phẩm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />
            </form>

            <div className="flex shrink-0 items-center gap-2">
              <Link href="/cart" className={getUtilityLinkClass(pathname.startsWith("/cart"))}>
                <ShoppingCart size={18} />
                Giỏ hàng
                <span className="absolute left-5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-600 px-1 text-[8px] text-white">
                  {cartCount}
                </span>
              </Link>

              <Link href="/wishlist" className={getUtilityLinkClass(pathname.startsWith("/wishlist"))}>
                <HeartIcon
                  size={18}
                  className={pathname.startsWith("/wishlist") ? "fill-green-100 text-green-700" : ""}
                />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="absolute left-5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[8px] text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {!user ? (
                <button
                  onClick={() =>
                    openSignIn({
                      redirectUrl: "/",
                    })
                  }
                  className="shrink-0 whitespace-nowrap rounded-full bg-indigo-500 px-8 py-2 text-white transition hover:bg-indigo-600"
                >
                  Đăng nhập
                </button>
              ) : (
                <div className="shrink-0">
                  <UserButton>
                    <UserButton.MenuItems>
                      <UserButton.Action
                        label="Wishlist"
                        onClick={() => router.push("/wishlist")}
                        labelIcon={<HeartIcon size={16} />}
                      />
                      <UserButton.Action
                        label="Đơn hàng của tôi"
                        onClick={() => router.push("/orders")}
                        labelIcon={<PackageIcon size={16} />}
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            {user ? (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Giỏ hàng"
                    onClick={() => router.push("/cart")}
                    labelIcon={<ShoppingCart size={16} />}
                  />
                  <UserButton.Action
                    label="Wishlist"
                    onClick={() => router.push("/wishlist")}
                    labelIcon={<HeartIcon size={16} />}
                  />
                  <UserButton.Action
                    label="Đơn hàng của tôi"
                    onClick={() => router.push("/orders")}
                    labelIcon={<PackageIcon size={16} />}
                  />
                </UserButton.MenuItems>
              </UserButton>
            ) : (
              <button
                onClick={() =>
                  openSignIn({
                    redirectUrl: "/",
                  })
                }
                className="rounded-full bg-indigo-500 px-4 py-2 text-sm text-white transition hover:bg-indigo-600"
              >
                Đăng nhập
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-slate-700 transition duration-300 ${
                mobileMenuOpen
                  ? "scale-95 border-green-200 bg-green-50 text-green-700"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="relative block h-5 w-5">
                <MenuIcon
                  size={20}
                  className={`absolute inset-0 transition-all duration-300 ${
                    mobileMenuOpen ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
                  }`}
                />
                <XIcon
                  size={20}
                  className={`absolute inset-0 transition-all duration-300 ${
                    mobileMenuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <div className="pb-3 sm:hidden">
          <form
            onSubmit={handleSearch}
            className={`flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3 transition-all duration-300 ${
              mobileMenuOpen ? "scale-[0.98] opacity-80" : "scale-100 opacity-100"
            }`}
          >
            <Search size={18} className="text-slate-600" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder-slate-600"
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              required
            />
          </form>
        </div>

        {mobileMenuVisible && (
          <div
            className={`relative z-40 origin-top overflow-hidden pb-4 transition-all duration-300 ease-out sm:hidden ${
              mobileMenuOpen
                ? "pointer-events-auto max-h-[32rem] translate-y-0 opacity-100"
                : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
            }`}
          >
            <div className={`rounded-[1.75rem] border border-white/70 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-all duration-300 ${
              mobileMenuOpen ? "scale-100" : "scale-[0.98]"
            }`}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Menu</p>
                </div>
                <div className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-medium text-green-700">
                  {wishlistCount} yêu thích
                </div>
              </div>

              <div className="grid gap-2">
                {navLinks.map((link, index) => (
                  <MobileLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    isActive={link.match(pathname)}
                    delay={40 + index * 35}
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-2">
                <Link
                  href="/cart"
                  className={`mobile-menu-item relative inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    pathname.startsWith("/cart")
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-50 text-slate-700 hover:bg-green-50 hover:text-green-700"
                  } ${mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                  style={{ transitionDelay: mobileMenuOpen ? "180ms" : "0ms" }}
                >
                  <ShoppingCart size={18} />
                  Giỏ hàng
                  <span className="ml-auto rounded-full bg-slate-600 px-2 py-0.5 text-[10px] text-white">
                    {cartCount}
                  </span>
                </Link>

                <Link
                  href="/wishlist"
                  className={`mobile-menu-item relative inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    pathname.startsWith("/wishlist")
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-50 text-slate-700 hover:bg-green-50 hover:text-green-700"
                  } ${mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                  style={{ transitionDelay: mobileMenuOpen ? "220ms" : "0ms" }}
                >
                  <HeartIcon size={18} className={pathname.startsWith("/wishlist") ? "fill-green-100 text-green-700" : ""} />
                  Wishlist
                  <span className="ml-auto rounded-full bg-green-600 px-2 py-0.5 text-[10px] text-white">
                    {wishlistCount}
                  </span>
                </Link>

                {user ? (
                  <Link
                    href="/orders"
                    className={`mobile-menu-item inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-green-50 hover:text-green-700 ${
                      mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                    }`}
                    style={{ transitionDelay: mobileMenuOpen ? "260ms" : "0ms" }}
                  >
                    <PackageIcon size={18} />
                    Đơn hàng của tôi
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      openSignIn({
                        redirectUrl: pathname || "/",
                      })
                    }
                    className={`mobile-menu-item rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-600 ${
                      mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                    }`}
                    style={{ transitionDelay: mobileMenuOpen ? "260ms" : "0ms" }}
                  >
                    Đăng nhập để mua sắm
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <hr className="border-gray-300" />
    </nav>
  );
};

export default Navbar;
