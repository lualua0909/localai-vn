import Link from "next/link";

const columns = [
  {
    title: "Nền tảng",
    links: [
      { label: "Khám phá sản phẩm", href: "#overview" },
      { label: "Danh mục AI", href: "#categories" },
      { label: "Sản phẩm nổi bật", href: "#featured" },
      { label: "Đăng sản phẩm", href: "#" },
      { label: "Bảng giá", href: "#pricing" },
    ],
  },
  {
    title: "Cộng đồng",
    links: [
      { label: "Blog", href: "#" },
      { label: "Sự kiện", href: "#" },
      { label: "Discord", href: "#" },
      { label: "Newsletter", href: "#" },
    ],
  },
  {
    title: "Tài nguyên",
    links: [
      { label: "Tài liệu API", href: "#" },
      { label: "Hướng dẫn", href: "#" },
      { label: "Status", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Pháp lý",
    links: [
      { label: "Điều khoản", href: "#" },
      { label: "Quyền riêng tư", href: "#" },
      { label: "Bảo mật", href: "#" },
      { label: "Cookie", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]">
      <div className="container-main section-padding">
        {/* Columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row">
          <p className="text-xs text-[var(--color-text-secondary)]">
            © {new Date().getFullYear()} LocalAI. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Tiếng Việt (VN)
          </p>
        </div>
      </div>
    </footer>
  );
}
