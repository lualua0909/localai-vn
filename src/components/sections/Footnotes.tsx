import { ScrollReveal } from "@/components/ui/ScrollReveal";

const notes = [
  {
    id: 1,
    text: "Gói Nhà phát triển được dùng thử miễn phí 14 ngày. Sau thời gian dùng thử, tài khoản sẽ tự động chuyển sang gói trả phí trừ khi bạn huỷ trước.",
  },
  {
    id: 2,
    text: "Gói Doanh nghiệp yêu cầu hợp đồng tối thiểu 6 tháng. Giá tuỳ chỉnh dựa trên nhu cầu và quy mô. Liên hệ đội ngũ để nhận báo giá.",
  },
];

export function Footnotes() {
  return (
    <section className="border-t border-[var(--color-border)] section-padding">
      <div className="container-main">
        <ScrollReveal>
          <h3 className="mb-8 text-lg font-semibold">Chú thích</h3>
        </ScrollReveal>
        <div className="space-y-4">
          {notes.map((note) => (
            <ScrollReveal key={note.id} delay={note.id * 0.04}>
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                <sup className="mr-1 font-semibold text-[var(--color-text)]">
                  ({note.id})
                </sup>
                {note.text}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
