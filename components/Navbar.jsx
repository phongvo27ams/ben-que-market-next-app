'use client'

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { HeartIcon, PackageIcon, Search, ShoppingCart } from "lucide-react";
import { useUser, useClerk, UserButton, Protect } from "@clerk/nextjs";

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const cartCount = useSelector((state) => state.cart.total);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);

  const navLinks = [
    { href: "/", label: "Trang Chủ", match: (path) => path === "/" },
    { href: "/shop", label: "Sản Phẩm", match: (path) => path.startsWith("/shop") || path.startsWith("/product") },
    { href: "/store", label: "Cửa Hàng", match: (path) => path.startsWith("/store") },
    { href: "/admin", label: "Admin", match: (path) => path.startsWith("/admin") },
  ];

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
  };

  return (
    <nav className="relative bg-white">
      <div className="mx-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 py-4 transition-all">
          <Link href="/" className="relative shrink-0 text-3xl font-semibold text-slate-700 lg:text-4xl">
            <span className="text-green-600">Bến Quê </span>
            Market
            <span className="text-5xl leading-0 text-green-600">.</span>
            <Protect plan="plus">
              <p className="absolute -right-8 -top-1 flex items-center gap-2 rounded-full bg-green-500 px-3 py-0.5 text-xs font-semibold text-white">
                Plus
              </p>
            </Protect>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 text-slate-600 sm:flex lg:gap-2">
            <div className="flex min-w-0 items-center gap-2">
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

            <form onSubmit={handleSearch} className="hidden min-w-[220px] max-w-xs flex-1 items-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm xl:flex">
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

          <div className="sm:hidden">
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
                onClick={openSignIn}
                className="rounded-full bg-indigo-500 px-7 py-1.5 text-sm text-white transition hover:bg-indigo-600"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>

        <div className="px-6 pb-3 sm:hidden">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3"
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
      </div>
      <hr className="border-gray-300" />
    </nav>
  );
};

export default Navbar;
