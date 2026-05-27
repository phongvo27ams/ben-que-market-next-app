'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { HeartIcon, MenuIcon, PackageIcon, Search, ShoppingCart, XIcon } from "lucide-react";
import axios from "axios";
import { useUser, useClerk, UserButton, useAuth } from "@clerk/nextjs";

const MOBILE_MENU_CLOSE_DELAY = 280;

const Navbar = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [membership, setMembership] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const cartCount = useSelector((state) => state.cart.total);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUserMeta = async () => {
      try {
        if (!user) {
          setMembership(null);
          setIsAdmin(false);
          return;
        }
        const token = await getToken();
        const membershipRes = await axios.get("/api/user/membership", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembership(membershipRes.data?.membership || null);

        try {
          const adminRes = await axios.get("/api/admin/is-admin", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsAdmin(Boolean(adminRes.data?.isAdmin));
        } catch {
          setIsAdmin(false);
        }
      } catch {
        setMembership(null);
        setIsAdmin(false);
      }
    };

    fetchUserMeta();
  }, [user, getToken, pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuVisible(true);
      return;
    }
    const timeout = setTimeout(() => setMobileMenuVisible(false), MOBILE_MENU_CLOSE_DELAY);
    return () => clearTimeout(timeout);
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isPlusMember = membership?.membershipPlan === "plus";
  const isPlusYearly = membership?.membershipPeriod === "yearly";
  const plusBadgeLabel = isPlusYearly ? "Plus" : "Plus";

  const navLinks = [
    { href: "/", label: "Trang Chủ", match: (path) => path === "/" },
    { href: "/shop", label: "Sản phẩm", match: (path) => path.startsWith("/shop") || path.startsWith("/product") },
    isAdmin
      ? { href: "/admin", label: "Admin", match: (path) => path.startsWith("/admin") }
      : { href: "/pricing", label: "Subscription", match: (path) => path.startsWith("/pricing") },
  ];

  const getNavLinkClass = (isActive) =>
    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
      isActive ? "bg-green-500 text-white shadow-sm" : "text-slate-600 hover:bg-green-50 hover:text-green-700"
    }`;

  const getUtilityLinkClass = (isActive) =>
    `relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-green-50 text-green-700" : "text-slate-600 hover:bg-green-50 hover:text-green-700"
    }`;

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="relative z-40 border-b border-slate-200 bg-white">
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-4">
          <Link href="/" className="relative shrink-0 text-2xl font-semibold text-slate-700 sm:text-3xl lg:text-4xl">
            <span className="text-green-600">Bến Quê </span>Market<span className="text-5xl leading-0 text-green-600">.</span>
            {mounted && isAdmin && (
              <p className="absolute -right-12 -top-2 z-10 rounded-full bg-green-500 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
                Admin
              </p>
            )}
            {mounted && !isAdmin && isPlusMember && (
              <p className={`absolute -right-10 -top-2 z-10 rounded-full px-3 py-0.5 text-xs font-semibold text-white shadow-sm ${
                isPlusYearly ? "bg-amber-500 ring-1 ring-amber-200" : "bg-slate-400 ring-1 ring-slate-200"
              }`}>
                {plusBadgeLabel}
              </p>
            )}
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 text-slate-600 sm:flex">
            <div className="ml-2 flex shrink-0 items-center gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={getNavLinkClass(link.match(pathname))}>
                  {link.label}
                </Link>
              ))}
            </div>

            <form onSubmit={handleSearch} className="hidden min-w-[150px] max-w-[210px] flex-1 items-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm xl:flex">
              <Search size={18} className="shrink-0 text-slate-600" />
              <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Tìm kiếm sản phẩm" value={search} onChange={(e) => setSearch(e.target.value)} required />
            </form>

            <div className="flex shrink-0 items-center gap-2">
              <Link href="/cart" className={getUtilityLinkClass(pathname.startsWith("/cart"))}>
                <ShoppingCart size={18} />Giỏ hàng
                {mounted && cartCount > 0 && <span className="absolute left-5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[8px] text-white">{cartCount}</span>}
              </Link>
              <Link href="/wishlist" className={getUtilityLinkClass(pathname.startsWith("/wishlist"))}>
                <HeartIcon size={18} className={pathname.startsWith("/wishlist") ? "fill-green-100 text-green-700" : ""} />
                Wishlist
                {mounted && wishlistCount > 0 && <span className="absolute left-5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[8px] text-white">{wishlistCount}</span>}
              </Link>
              {!mounted ? (
                <div className="h-10 w-28 shrink-0 rounded-full bg-slate-100" />
              ) : !user ? (
                <button onClick={() => openSignIn({ redirectUrl: "/" })} className="shrink-0 rounded-full bg-indigo-500 px-8 py-2 text-white transition hover:bg-indigo-600">Đăng nhập</button>
              ) : (
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action label="Wishlist" onClick={() => router.push("/wishlist")} labelIcon={<HeartIcon size={16} />} />
                    <UserButton.Action label="Đơn hàng của tôi" onClick={() => router.push("/orders")} labelIcon={<PackageIcon size={16} />} />
                  </UserButton.MenuItems>
                </UserButton>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            {!mounted ? <div className="h-10 w-24 rounded-full bg-slate-100" /> : user ? <UserButton /> : <button onClick={() => openSignIn({ redirectUrl: "/" })} className="rounded-full bg-indigo-500 px-4 py-2 text-sm text-white">Đăng nhập</button>}
            <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700">
              {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

        <div className="pb-3 sm:hidden">
          <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3">
            <Search size={18} className="text-slate-600" />
            <input className="w-full bg-transparent text-sm outline-none placeholder-slate-600" type="text" placeholder="Tìm kiếm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} required />
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
