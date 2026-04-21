'use client'

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { PackageIcon, Search, ShoppingCart } from "lucide-react";
import { useUser, useClerk, UserButton, Protect } from "@clerk/nextjs";

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const cartCount = useSelector(state => state.cart.total);

  const navLinks = [
    { href: "/", label: "Trang Chủ", match: (path) => path === "/" },
    { href: "/shop", label: "Sản Phẩm", match: (path) => path.startsWith("/shop") || path.startsWith("/product") },
    { href: "/store", label: "Cửa Hàng", match: (path) => path.startsWith("/store") },
    { href: "/admin", label: "Admin", match: (path) => path.startsWith("/admin") },
  ];

  const getNavLinkClass = (isActive) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-all ${
      isActive
        ? "bg-green-500 text-white shadow-sm"
        : "text-slate-600 hover:bg-green-50 hover:text-green-700"
    }`;

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
  }

  return (
    <nav className="relative bg-white">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

          <Link href="/" className="relative text-4xl font-semibold text-slate-700">
            <span className="text-green-600">Bến Quê </span>Market<span className="text-green-600 text-5xl leading-0">.</span>
            <Protect plan="plus">
              <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                Plus
              </p>
            </Protect>
          </Link>

          <div className="hidden sm:flex items-center gap-4 lg:gap-2 text-slate-600">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={getNavLinkClass(link.match(pathname))}
              >
                {link.label}
              </Link>
            ))}

            <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
              <Search size={18} className="text-slate-600" />
              <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Tìm kiếm sản phẩm" value={search} onChange={(e) => setSearch(e.target.value)} required />
            </form>

            <Link href="/cart" className="relative flex items-center gap-2 text-slate-600 hover:text-green-700 transition">
              <ShoppingCart size={18} />
              Giỏ hàng
              <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
            </Link>

            {
              !user ? (
                <button
                  onClick={() =>
                    openSignIn({
                      redirectUrl: '/',
                    })
                  }
                  className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
                >
                  Đăng nhập
                </button>
              ) : (
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="Đơn hàng của tôi"
                      onClick={() => router.push('/orders')}
                      labelIcon={<PackageIcon size={16} />}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              )
            }
          </div>

          <div className="sm:hidden">
            {
              user ? (
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="Giỏ hàng"
                      onClick={() => router.push('/cart')}
                      labelIcon={<ShoppingCart size={16} />}
                    />
                    <UserButton.Action
                      label="Đơn hàng của tôi"
                      onClick={() => router.push('/orders')}
                      labelIcon={<PackageIcon size={16} />}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              ) : (
                <button
                  onClick={openSignIn}
                  className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full"
                >
                  Đăng nhập
                </button>
              )
            }
          </div>
        </div>

        <div className="sm:hidden px-6 pb-3">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-full"
          >
            <Search size={18} className="text-slate-600" />
            <input
              className="w-full bg-transparent outline-none placeholder-slate-600 text-sm"
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
  )
}

export default Navbar;
