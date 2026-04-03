import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CourseDetailLoader } from "@/components/loading";

export default function CourseSlugLoading() {
  return (
    <>
      <Header />
      <main className="bg-[#f3f0e8] px-3 pb-8 pt-0 sm:px-4 sm:pb-10 lg:px-6 lg:pb-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="overflow-hidden rounded-[0_0_28px_28px] border border-t-0 border-[rgba(17,17,17,0.12)] bg-[#f8f5ed] shadow-[0_18px_60px_rgba(58,45,23,0.08)]">
            <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              <CourseDetailLoader />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
