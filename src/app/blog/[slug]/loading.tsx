import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogArticleLoader } from "@/components/loading";

export default function BlogSlugLoading() {
  return (
    <>
      <Header />
      <main className="container-main section-padding">
        <BlogArticleLoader />
      </main>
      <Footer />
    </>
  );
}
