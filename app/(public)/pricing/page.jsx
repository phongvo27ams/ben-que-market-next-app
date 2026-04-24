import Link from "next/link";
import {
  BadgePercentIcon,
  CheckCircle2Icon,
  CrownIcon,
  GiftIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TruckIcon,
} from "lucide-react";

const plans = [
  {
    name: "Free",
    accent: "from-slate-100 via-white to-slate-50",
    border: "border-slate-200",
    badge: "Dùng ngay",
    priceMonthly: "0 đ",
    priceYearly: "0 đ",
    description: "Phù hợp để mua sắm hằng ngày, trải nghiệm chợ đặc sản số và khám phá sản phẩm mới.",
    ctaLabel: "Bắt đầu miễn phí",
    ctaHref: "/shop",
    ctaClass: "bg-slate-800 text-white hover:bg-slate-900",
    features: [
      "Mua sắm toàn bộ sản phẩm trong hệ thống",
      "Lưu sản phẩm yêu thích vào Wishlist",
      "Theo dõi đơn hàng và đánh giá sau mua",
      "Nhận ưu đãi công khai theo từng chương trình",
    ],
    limitations: [
      "Có tính phí vận chuyển theo đơn hàng",
      "Không dùng được mã giảm giá chỉ dành cho Plus",
    ],
  },
  {
    name: "Plus",
    accent: "from-emerald-100 via-white to-lime-50",
    border: "border-emerald-200",
    badge: "Đề xuất",
    priceMonthly: "49.000 đ",
    priceYearly: "499.000 đ",
    description: "Dành cho khách hàng mua thường xuyên, muốn tiết kiệm hơn trên mỗi đơn và nhận ưu đãi riêng.",
    ctaLabel: "Nâng cấp Plus",
    ctaHref: "#so-sanh-goi",
    ctaClass: "bg-green-600 text-white hover:bg-green-700",
    features: [
      "Miễn phí vận chuyển cho đơn hàng đủ điều kiện",
      "Được áp dụng coupon độc quyền cho thành viên Plus",
      "Nhận thông báo ưu đãi theo mùa và chiến dịch sớm hơn",
      "Ưu tiên tiếp cận combo tiết kiệm và quà tặng thành viên",
      "Phù hợp cho khách hàng mua lặp lại mỗi tháng",
    ],
    highlight: "Tiết kiệm rõ nhất nếu bạn mua từ 2 đến 4 đơn mỗi tháng.",
  },
];

const comparisonRows = [
  {
    label: "Mua sắm toàn bộ sản phẩm",
    free: "Có",
    plus: "Có",
    icon: ShoppingBagIcon,
  },
  {
    label: "Wishlist và theo dõi đơn hàng",
    free: "Có",
    plus: "Có",
    icon: ShieldCheckIcon,
  },
  {
    label: "Phí vận chuyển",
    free: "Tính theo đơn",
    plus: "Miễn phí",
    icon: TruckIcon,
  },
  {
    label: "Coupon dành riêng cho thành viên",
    free: "Không",
    plus: "Có",
    icon: BadgePercentIcon,
  },
  {
    label: "Ưu đãi theo mùa / quà tặng khách thân thiết",
    free: "Cơ bản",
    plus: "Ưu tiên trước",
    icon: GiftIcon,
  },
  {
    label: "Mức phù hợp",
    free: "Mua thỉnh thoảng",
    plus: "Mua thường xuyên",
    icon: SparklesIcon,
  },
];

const reasons = [
  {
    title: "Tiết kiệm thực tế trên từng đơn",
    text: "Miễn phí vận chuyển và coupon riêng giúp thành viên Plus thấy lợi ích rõ ràng ngay trong quá trình thanh toán.",
    icon: TruckIcon,
  },
  {
    title: "Bạn được chăm sóc tốt hơn",
    text: "Khách hàng thân thiết sẽ nhận được nhiều ưu đãi riêng, quà riêng và quyền lợi rõ ràng.",
    icon: CrownIcon,
  },
  {
    title: "Dễ hiểu, dễ quyết định",
    text: "Chỉ cần hai gói Free và Plus là đủ rõ: một gói để trải nghiệm, một gói để mua sắm thường xuyên và tối ưu chi phí.",
    icon: CheckCircle2Icon,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-14 text-slate-800 sm:px-8 lg:px-10">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.22),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-6 py-10 sm:px-10 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
            <CrownIcon size={16} />
            Gói thành viên Bến Quê Market
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Chọn gói phù hợp để mua sắm đặc sản thông minh hơn
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Chúng tôi đề xuất giữ cấu trúc đơn giản với 2 gói: <span className="font-semibold text-slate-800">Free</span> để bắt đầu
            trải nghiệm, và <span className="font-semibold text-green-700">Plus</span> dành riêng cho khách hàng mua thường xuyên bằng nhiều ưu đãi thật sự hấp dẫn.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`flex h-full flex-col rounded-[2rem] border ${plan.border} bg-gradient-to-br ${plan.accent} p-6 shadow-sm sm:p-8`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{plan.badge}</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">{plan.name}</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">{plan.description}</p>
              </div>
              {plan.name === "Plus" && (
                <div className="rounded-2xl bg-white/80 p-3 text-green-600 shadow-sm">
                  <CrownIcon size={26} />
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/80 bg-white/80 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Theo tháng</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{plan.priceMonthly}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Theo năm</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{plan.priceYearly}</p>
                {plan.name === "Plus" && <p className="mt-2 text-sm text-green-700">Tiết kiệm gần 2 tháng khi đăng ký theo năm</p>}
              </div>
            </div>

            <ul className="mt-7 flex-1 space-y-3 text-sm leading-6 text-slate-700 sm:text-base">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2Icon className="mt-0.5 shrink-0 text-green-600" size={18} />
                  <span>{feature}</span>
                </li>
              ))}
              {plan.limitations?.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-slate-500">
                  <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {plan.highlight && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {plan.highlight}
              </div>
            )}

            <Link
              href={plan.ctaHref}
              className={`mt-7 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition sm:text-base ${plan.ctaClass}`}
            >
              {plan.ctaLabel}
            </Link>
          </article>
        ))}
      </section>

      <section id="so-sanh-goi" className="mt-14 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-green-600">So sánh ưu đãi</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Free và Plus khác nhau ở đâu?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Điểm khác biệt quan trọng nhất là <span className="font-semibold text-slate-800">Plus mang lại lợi ích tài chính lặp lại</span>:
            miễn phí vận chuyển, coupon riêng và các ưu đãi dành cho khách hàng thân thiết.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200">
          <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr] bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 sm:px-6 sm:text-base">
            <p>Quyền lợi</p>
            <p className="text-center">Free</p>
            <p className="text-center text-green-700">Plus</p>
          </div>
          {comparisonRows.map((row) => {
            const Icon = row.icon;

            return (
              <div
                key={row.label}
                className="grid grid-cols-[1.5fr_0.8fr_0.8fr] items-center gap-3 border-t border-slate-200 px-4 py-4 text-sm text-slate-600 sm:px-6 sm:text-base"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                    <Icon size={18} />
                  </div>
                  <p className="leading-6 text-slate-700">{row.label}</p>
                </div>
                <p className="text-center">{row.free}</p>
                <p className="text-center font-semibold text-green-700">{row.plus}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
