/**
 * Firestore Seed Script
 *
 * Seeds the Firestore database with mock app and blog data.
 *
 * Usage:
 *   npx tsx scripts/seed-firestore.ts
 *
 * Note: If running with plain Node, ensure "type": "module" is set in
 * package.json or use the .mts extension. With `tsx` this is not required.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ---------------------------------------------------------------------------
// 1. Initialize Firebase Admin
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = resolve(
  __dirname,
  "../local-ai-6b086-firebase-adminsdk-fbsvc-a9715b58e1.json"
);

console.log("Reading service account from:", serviceAccountPath);

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

// ---------------------------------------------------------------------------
// 2. Shared data helpers
// ---------------------------------------------------------------------------

interface Feature {
  title: string;
  description: string;
}

interface PricingPlan {
  plan: string;
  price: string;
  features: string[];
}

interface AppData {
  name: string;
  slug: string;
  tagline: string;
  category: string;
  rating: number;
  reviewsCount: string;
  trending?: boolean;
  author: string;
  icon: string;
  description: string;
  screenshots: string[];
  features: Feature[];
  pricing: PricingPlan[];
  status: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

interface BlogData {
  title: string;
  slug: string;
  description: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  content: string;
  status: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

const defaultFeatures: Feature[] = [
  {
    title: "Tiếng Việt tối ưu",
    description: "Được huấn luyện đặc biệt cho ngôn ngữ và văn hoá Việt Nam.",
  },
  {
    title: "Hiệu suất cao",
    description: "Xử lý tác vụ nhanh chóng với độ chính xác hàng đầu.",
  },
  {
    title: "Dễ dàng tích hợp",
    description: "API đơn giản, tài liệu chi tiết cho nhà phát triển.",
  },
];

const defaultPricing: PricingPlan[] = [
  {
    plan: "Cơ bản",
    price: "Miễn phí",
    features: ["Tính năng cơ bản", "Hỗ trợ cộng đồng"],
  },
  {
    plan: "Chuyên nghiệp",
    price: "199.000đ/tháng",
    features: ["Tất cả tính năng", "Hỗ trợ 24/7", "Không giới hạn"],
  },
];

// ---------------------------------------------------------------------------
// 3. Apps data (20 apps)
// ---------------------------------------------------------------------------

const apps: AppData[] = [
  {
    name: "VietGPT",
    slug: "vietgpt",
    tagline: "Chatbot AI #1 Việt Nam",
    category: "Chatbot",
    rating: 4.8,
    reviewsCount: "2.1K",
    trending: true,
    author: "VietAI Team",
    icon: "https://placehold.co/100x100/0891b2/white?text=VG",
    description:
      "<p>Trải nghiệm chatbot AI tiếng Việt thông minh nhất, hỗ trợ đa ngữ cảnh.</p>",
    screenshots: [
      "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
      "https://assets.aceternity.com/animated-modal.png",
      "https://assets.aceternity.com/animated-testimonials.webp",
      "https://assets.aceternity.com/cloudinary_bkp/Tooltip_luwy44.png",
      "https://assets.aceternity.com/github-globe.png",
    ],
    features: [
      {
        title: "Tiếng Việt tự nhiên",
        description:
          "Hiểu và phản hồi tiếng Việt với ngữ điệu tự nhiên nhất.",
      },
      {
        title: "Hỗ trợ đa ngành",
        description:
          "Kiến thức chuyên sâu trong các lĩnh vực Y tế, Luật, và Giáo dục tại Việt Nam.",
      },
    ],
    pricing: [
      {
        plan: "Cơ bản",
        price: "Miễn phí",
        features: ["100 tin nhắn/ngày", "Tốc độ tiêu chuẩn"],
      },
      {
        plan: "Nâng cao",
        price: "99.000đ/tháng",
        features: ["Không giới hạn", "Tốc độ cao", "Ưu tiên hỗ trợ"],
      },
    ],
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "PixelAI Studio",
    slug: "pixelaistudio",
    tagline: "Sáng tạo hình ảnh không giới hạn",
    category: "Tạo ảnh",
    rating: 4.7,
    reviewsCount: "1.5K",
    author: "PixelLabs",
    icon: "https://placehold.co/100x100/8b5cf6/white?text=PS",
    description:
      "<p>Tạo ảnh sản phẩm chuyên nghiệp bằng AI trong 30 giây.</p>",
    screenshots: [
      "https://assets.aceternity.com/demos/aceternity-ui-demo.png",
      "https://assets.aceternity.com/demos/algochurn.png",
    ],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "CodeBuddy VN",
    slug: "codebuddyvn",
    tagline: "Trợ lý lập trình AI",
    category: "Code Assistant",
    rating: 4.6,
    reviewsCount: "980",
    author: "DevTorch",
    icon: "https://placehold.co/100x100/10b981/white?text=CB",
    description:
      "<p>Trợ lý lập trình AI hỗ trợ developer Việt Nam, tích hợp trực tiếp vào VS Code.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "EduMentor",
    slug: "edumentor",
    tagline: "Gia sư AI cá nhân hoá",
    category: "Giáo dục",
    rating: 4.9,
    reviewsCount: "3.2K",
    trending: true,
    author: "EduTech VN",
    icon: "https://placehold.co/100x100/f59e0b/white?text=EM",
    description:
      "<p>Gia sư AI 1 kèm 1, cá nhân hoá lộ trình học tập cho học sinh Việt Nam.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "VoiceAI Việt",
    slug: "voiceaiviet",
    tagline: "Chuyển giọng nói thành văn bản",
    category: "Tiện ích",
    rating: 4.5,
    reviewsCount: "870",
    author: "VoiVoice",
    icon: "https://placehold.co/100x100/ef4444/white?text=VA",
    description:
      "<p>Công nghệ nhận diện giọng nói tiếng Việt chính xác 99%, hỗ trợ cả giọng vùng miền.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "DocuScan AI",
    slug: "docuscanai",
    tagline: "OCR thông minh cho tiếng Việt",
    category: "Tiện ích",
    rating: 4.4,
    reviewsCount: "650",
    trending: true,
    author: "ScanSoft",
    icon: "https://placehold.co/100x100/6366f1/white?text=DS",
    description:
      "<p>Số hoá tài liệu tiếng Việt nhanh chóng, hỗ trợ nhận diện chữ viết tay.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "MarketBot",
    slug: "marketbot",
    tagline: "Tự động hoá marketing bằng AI",
    category: "Sáng tạo",
    rating: 4.3,
    reviewsCount: "520",
    author: "GrowthAI",
    icon: "https://placehold.co/100x100/ec4899/white?text=MB",
    description:
      "<p>Giải pháp marketing tự động toàn diện cho doanh nghiệp SME.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "HealthCheck AI",
    slug: "healthcheckai",
    tagline: "Tư vấn sức khoẻ bằng AI",
    category: "Y tế",
    rating: 4.6,
    reviewsCount: "1.1K",
    author: "MedTech Asia",
    icon: "https://placehold.co/100x100/14b8a6/white?text=HC",
    description:
      "<p>Trợ lý sức khoẻ cá nhân, tư vấn sơ bộ và nhắc nhở lịch uống thuốc.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "FinBot",
    slug: "finbot",
    tagline: "Trợ lý tài chính thông minh",
    category: "Tài chính",
    rating: 4.5,
    reviewsCount: "780",
    author: "FinWise",
    icon: "https://placehold.co/100x100/f43f5e/white?text=FB",
    description:
      "<p>Quản lý tài chính cá nhân và đầu tư thông minh với sự hỗ trợ của AI.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "DataSense",
    slug: "datasense",
    tagline: "Phân tích dữ liệu tự động",
    category: "Tiện ích",
    rating: 4.4,
    reviewsCount: "430",
    author: "DataWiz",
    icon: "https://placehold.co/100x100/3b82f6/white?text=DS",
    description:
      "<p>Biến dữ liệu thô thành biểu đồ và insights có giá trị trong tích tắc.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "TranslateVN",
    slug: "translatevn",
    tagline: "Dịch thuật AI Việt-Anh chính xác",
    category: "Tiện ích",
    rating: 4.7,
    reviewsCount: "2.5K",
    author: "LinguaTech",
    icon: "https://placehold.co/100x100/8b5cf6/white?text=TV",
    description:
      "<p>Công cụ dịch thuật chuyên dụng cho cặp ngôn ngữ Anh-Việt, hiểu rõ ngữ cảnh văn hoá.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "StoryAI",
    slug: "storyai",
    tagline: "Tạo nội dung sáng tạo bằng AI",
    category: "Sáng tạo",
    rating: 4.3,
    reviewsCount: "380",
    author: "CreativeMind",
    icon: "https://placehold.co/100x100/f97316/white?text=SA",
    description:
      "<p>Sáng tác truyện, kịch bản, và nội dung marketing không giới hạn.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "LegalAI VN",
    slug: "legalaivn",
    tagline: "Tư vấn pháp luật AI tiếng Việt",
    category: "Tiện ích",
    rating: 4.2,
    reviewsCount: "290",
    author: "LawTech",
    icon: "https://placehold.co/100x100/64748b/white?text=LA",
    description:
      "<p>Tra cứu văn bản pháp luật và tư vấn pháp lý cơ bản nhanh chóng.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "FarmSmart",
    slug: "farmsmart",
    tagline: "AI hỗ trợ nông nghiệp thông minh",
    category: "Tiện ích",
    rating: 4.1,
    reviewsCount: "210",
    author: "AgriTech",
    icon: "https://placehold.co/100x100/84cc16/white?text=FS",
    description:
      "<p>Phát hiện sâu bệnh và tối ưu hoá quy trình canh tác cho nông dân.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "TutorMath",
    slug: "tutormath",
    tagline: "Giải toán và giảng dạy bằng AI",
    category: "Giáo dục",
    rating: 4.8,
    reviewsCount: "1.8K",
    trending: true,
    author: "MathGenius",
    icon: "https://placehold.co/100x100/06b6d4/white?text=TM",
    description:
      "<p>Giải toán chi tiết từng bước, từ cơ bản đến nâng cao.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "PhotoFix AI",
    slug: "photofixai",
    tagline: "Chỉnh sửa và phục hồi ảnh bằng AI",
    category: "Tạo ảnh",
    rating: 4.5,
    reviewsCount: "920",
    author: "PixelPerfect",
    icon: "https://placehold.co/100x100/d946ef/white?text=PA",
    description:
      "<p>Phục hồi ảnh cũ, làm nét ảnh mờ và xoá vật thể thừa tự động.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "ChatDoc",
    slug: "chatdoc",
    tagline: "Chat với tài liệu PDF bằng AI",
    category: "Chatbot",
    rating: 4.6,
    reviewsCount: "1.3K",
    author: "DocTalk",
    icon: "https://placehold.co/100x100/3b82f6/white?text=CD",
    description:
      "<p>Tóm tắt và trả lời câu hỏi từ tài liệu PDF dài hàng trăm trang trong giây lát.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "MusicGen VN",
    slug: "musicgenvn",
    tagline: "Sáng tác nhạc bằng AI",
    category: "Sáng tạo",
    rating: 4.0,
    reviewsCount: "180",
    author: "SoundLab",
    icon: "https://placehold.co/100x100/a855f7/white?text=MG",
    description:
      "<p>Tạo giai điệu và bài hát mới mang âm hưởng Việt Nam.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "ResumeAI",
    slug: "resumeai",
    tagline: "Tạo CV chuyên nghiệp với AI",
    category: "Tiện ích",
    rating: 4.4,
    reviewsCount: "560",
    author: "CareerBoost",
    icon: "https://placehold.co/100x100/475569/white?text=RA",
    description:
      "<p>Tối ưu hoá CV của bạn để vượt qua hệ thống ATS và gây ấn tượng với nhà tuyển dụng.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    name: "SpeechCoach",
    slug: "speechcoach",
    tagline: "Luyện phát âm tiếng Anh với AI",
    category: "Giáo dục",
    rating: 4.7,
    reviewsCount: "1.4K",
    author: "LingoMaster",
    icon: "https://placehold.co/100x100/ea580c/white?text=SC",
    description:
      "<p>Phản hồi chi tiết về phát âm, ngữ điệu và trọng âm giúp bạn nói tiếng Anh tự tin hơn.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
];

// ---------------------------------------------------------------------------
// 4. Blogs data (6 blogs)
// ---------------------------------------------------------------------------

const blogs: BlogData[] = [
  {
    title: "AI Việt Nam 2025: Xu hướng và cơ hội",
    slug: "ai-viet-nam-2025-xu-huong-va-co-hoi",
    description:
      "Tổng quan về thị trường AI Việt Nam, những xu hướng nổi bật và cơ hội cho các startup công nghệ trong năm 2025.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    author: "Minh Trần",
    date: "10 Th02, 2026",
    category: "Xu hướng",
    readTime: "8 phút đọc",
    content: `# AI Việt Nam 2025: Xu hướng và cơ hội

Năm 2025 đánh dấu bước ngoặt quan trọng cho ngành trí tuệ nhân tạo tại Việt Nam. Với sự bùng nổ của các mô hình ngôn ngữ lớn (LLM) và sự quan tâm ngày càng tăng từ cả khu vực công lẫn tư nhân, Việt Nam đang nhanh chóng trở thành một trong những thị trường AI năng động nhất Đông Nam Á.

## Thị trường AI Việt Nam đang ở đâu?

Theo báo cáo mới nhất, thị trường AI Việt Nam đã đạt giá trị hơn 500 triệu USD vào cuối năm 2025, tăng trưởng 35% so với năm trước. Các lĩnh vực dẫn đầu bao gồm xử lý ngôn ngữ tự nhiên (NLP), thị giác máy tính (Computer Vision), và tự động hoá quy trình kinh doanh (RPA). Đặc biệt, nhóm các sản phẩm AI phục vụ tiếng Việt đã có bước phát triển vượt bậc với hàng chục sản phẩm được ra mắt trong năm qua.

## Xu hướng nổi bật

**AI tạo sinh (Generative AI)** tiếp tục là xu hướng chủ đạo, nhưng điểm khác biệt là sự tập trung vào nội dung tiếng Việt. Các mô hình được fine-tune riêng cho tiếng Việt đã cho thấy hiệu suất vượt trội so với các mô hình đa ngôn ngữ chung. Bên cạnh đó, **AI trong giáo dục** và **AI trong nông nghiệp** là hai lĩnh vực đang nhận được nhiều đầu tư và sự quan tâm đặc biệt từ cộng đồng khởi nghiệp.

Với những tín hiệu tích cực này, năm 2026 hứa hẹn sẽ là năm bùng nổ tiếp theo cho hệ sinh thái AI Việt Nam.`,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    title: "Xây dựng Chatbot tiếng Việt với LLM",
    slug: "xay-dung-chatbot-tieng-viet-voi-llm",
    description:
      "Hướng dẫn chi tiết cách fine-tune mô hình ngôn ngữ lớn cho tiếng Việt, từ chuẩn bị dữ liệu đến triển khai sản phẩm.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80",
    author: "Hương Nguyễn",
    date: "08 Th02, 2026",
    category: "Hướng dẫn",
    readTime: "12 phút đọc",
    content: `# Xây dựng Chatbot tiếng Việt với LLM

Việc xây dựng một chatbot tiếng Việt chất lượng cao không còn là điều xa vời nhờ sự phát triển của các mô hình ngôn ngữ lớn (LLM). Trong bài viết này, chúng ta sẽ đi qua từng bước để tạo ra một chatbot có khả năng hiểu và phản hồi tiếng Việt tự nhiên.

## Bước 1: Chuẩn bị dữ liệu

Chất lượng dữ liệu huấn luyện là yếu tố quyết định thành công của chatbot. Đối với tiếng Việt, bạn cần thu thập dữ liệu từ nhiều nguồn khác nhau: hội thoại thực tế, văn bản tin tức, tài liệu chuyên ngành, và nội dung mạng xã hội. Điều quan trọng là dữ liệu phải bao phủ đa dạng chủ đề, phong cách ngôn ngữ, và cả các biến thể vùng miền của tiếng Việt.

## Bước 2: Lựa chọn mô hình nền

Hiện tại có nhiều lựa chọn mô hình nền phù hợp cho việc fine-tune tiếng Việt. Các mô hình như Llama, Mistral, hay Qwen đều có phiên bản mở cho phép tuỳ chỉnh. Việc lựa chọn phụ thuộc vào yêu cầu về kích thước mô hình, tốc độ phản hồi, và tài nguyên phần cứng bạn có.

Hãy bắt đầu với một mô hình nhỏ (7B parameters) để thử nghiệm trước khi mở rộng quy mô. Đây là cách tiếp cận hiệu quả nhất về chi phí và thời gian.`,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    title: "So sánh các nền tảng AI-as-a-Service tại Việt Nam",
    slug: "so-sanh-cac-nen-tang-ai-as-a-service-tai-viet-nam",
    description:
      "Đánh giá chi tiết các dịch vụ AI cloud phổ biến nhất dành cho nhà phát triển và doanh nghiệp Việt Nam.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    author: "Đức Phạm",
    date: "05 Th02, 2026",
    category: "So sánh",
    readTime: "10 phút đọc",
    content: `# So sánh các nền tảng AI-as-a-Service tại Việt Nam

Thị trường AI-as-a-Service (AIaaS) tại Việt Nam đang ngày càng cạnh tranh với sự tham gia của cả các ông lớn công nghệ quốc tế lẫn các startup nội địa. Bài viết này sẽ giúp bạn có cái nhìn tổng quan để lựa chọn nền tảng phù hợp nhất.

## Tiêu chí đánh giá

Chúng tôi đánh giá dựa trên 5 tiêu chí chính: **chất lượng API**, **hỗ trợ tiếng Việt**, **giá cả**, **tài liệu hướng dẫn**, và **dịch vụ hỗ trợ khách hàng**. Mỗi tiêu chí được chấm điểm từ 1-10 dựa trên trải nghiệm thực tế của đội ngũ kỹ thuật.

## Các nền tảng nổi bật

Trong số các nền tảng được đánh giá, những cái tên nổi bật bao gồm các giải pháp hỗ trợ tiếng Việt tốt nhất với khả năng xử lý ngôn ngữ tự nhiên chính xác, cùng mức giá cạnh tranh phù hợp với thị trường Việt Nam. Điểm chung của các nền tảng hàng đầu là đều cung cấp SDK cho nhiều ngôn ngữ lập trình và tài liệu đầy đủ bằng tiếng Việt.`,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    title: "Computer Vision ứng dụng trong nông nghiệp Việt Nam",
    slug: "computer-vision-ung-dung-trong-nong-nghiep-viet-nam",
    description:
      "Câu chuyện về những startup Việt đang dùng thị giác máy tính để giải quyết bài toán nông nghiệp thực tế.",
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80",
    author: "Lan Lê",
    date: "01 Th02, 2026",
    category: "Case Study",
    readTime: "7 phút đọc",
    content: `# Computer Vision ứng dụng trong nông nghiệp Việt Nam

Nông nghiệp Việt Nam đang trải qua cuộc cách mạng số hoá, và thị giác máy tính (Computer Vision) đóng vai trò then chốt trong quá trình chuyển đổi này. Từ việc phát hiện sâu bệnh trên cây trồng đến phân loại nông sản tự động, AI đang giúp nông dân Việt Nam nâng cao năng suất và giảm thiểu rủi ro.

## Bài toán thực tế

Một trong những ứng dụng thành công nhất là hệ thống nhận diện sâu bệnh trên lúa. Bằng cách chụp ảnh lá lúa qua smartphone, nông dân có thể nhận được chẩn đoán chính xác về loại bệnh và khuyến nghị xử lý trong vài giây. Hệ thống đã được triển khai tại hơn 10 tỉnh Đồng bằng sông Cửu Long và giúp giảm 25% chi phí thuốc bảo vệ thực vật.

## Thách thức và cơ hội

Thách thức lớn nhất vẫn là việc thu thập dữ liệu huấn luyện chất lượng cao cho các loại cây trồng đặc thù của Việt Nam. Tuy nhiên, với sự hỗ trợ từ các chương trình nghiên cứu và quỹ đầu tư, ngày càng nhiều bộ dữ liệu mở được chia sẻ, tạo điều kiện cho sự phát triển nhanh chóng của các giải pháp AI nông nghiệp.`,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    title: "Prompt Engineering cho người Việt",
    slug: "prompt-engineering-cho-nguoi-viet",
    description:
      "Kỹ thuật viết prompt hiệu quả bằng tiếng Việt để tận dụng tối đa sức mạnh của các mô hình AI.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
    author: "Tuấn Vũ",
    date: "28 Th01, 2026",
    category: "Hướng dẫn",
    readTime: "9 phút đọc",
    content: `# Prompt Engineering cho người Việt

Prompt engineering - nghệ thuật viết lệnh cho AI - đang trở thành kỹ năng thiết yếu trong thời đại AI. Đặc biệt với tiếng Việt, có những mẹo và kỹ thuật riêng giúp bạn khai thác tối đa khả năng của các mô hình ngôn ngữ lớn.

## Tại sao prompt tiếng Việt cần đặc biệt?

Tiếng Việt có nhiều đặc điểm ngôn ngữ độc đáo: thanh điệu, từ Hán-Việt, cách dùng đại từ phong phú, và ngữ cảnh văn hoá riêng. Một prompt tiếng Việt tốt cần tận dụng những đặc điểm này thay vì chỉ dịch trực tiếp từ tiếng Anh. Ví dụ, việc chỉ định rõ phong cách ngôn ngữ (trang trọng, thân mật, chuyên ngành) sẽ cho kết quả tốt hơn nhiều.

## Các kỹ thuật cơ bản

**Chain of Thought (Chuỗi suy luận):** Hướng dẫn AI suy nghĩ từng bước bằng tiếng Việt. Thay vì yêu cầu câu trả lời trực tiếp, hãy yêu cầu AI "phân tích từng bước" hoặc "giải thích logic" trước khi đưa ra kết luận. Kỹ thuật này đặc biệt hiệu quả với các bài toán phức tạp và câu hỏi yêu cầu suy luận nhiều lớp.`,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    title: "Cộng đồng AI Việt Nam: Nhìn lại 2025",
    slug: "cong-dong-ai-viet-nam-nhin-lai-2025",
    description:
      "Tổng kết một năm phát triển mạnh mẽ của cộng đồng AI Việt Nam với những sự kiện, sản phẩm, và con người nổi bật.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    author: "Mai Anh",
    date: "25 Th01, 2026",
    category: "Cộng đồng",
    readTime: "6 phút đọc",
    content: `# Cộng đồng AI Việt Nam: Nhìn lại 2025

Năm 2025 là một năm đáng nhớ với cộng đồng AI Việt Nam. Từ những hackathon quy mô lớn đến sự ra đời của hàng loạt sản phẩm AI "made in Vietnam", cộng đồng đã chứng minh rằng Việt Nam hoàn toàn có thể cạnh tranh trên bản đồ AI thế giới.

## Những điểm sáng của năm

Sự kiện lớn nhất năm phải kể đến là AI Summit Vietnam 2025 với sự tham gia của hơn 5.000 người, quy tụ các chuyên gia hàng đầu trong và ngoài nước. Bên cạnh đó, chuỗi meetup AI hàng tháng tại TP.HCM và Hà Nội đã thu hút hàng trăm lượt tham gia mỗi phiên, tạo nên một hệ sinh thái trao đổi kiến thức sôi động.

## Sản phẩm nổi bật

Nhiều sản phẩm AI Việt Nam đã vươn ra thị trường quốc tế trong năm qua. Đặc biệt trong lĩnh vực xử lý ngôn ngữ tự nhiên tiếng Việt, các công cụ chatbot, dịch thuật, và tạo nội dung đã nhận được phản hồi tích cực từ cộng đồng người dùng. Đây là tín hiệu đáng mừng cho thấy tiềm năng to lớn của thị trường AI Việt Nam trong những năm tới.`,
    status: "published",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
];

// ---------------------------------------------------------------------------
// 5. Categories data
// ---------------------------------------------------------------------------

interface CategoryData {
  name: string;
  label_en: string;
  label_vi: string;
  order: number;
}

const categories: CategoryData[] = [
  { name: "Chatbot", label_en: "Chatbot", label_vi: "Chatbot", order: 0 },
  { name: "Tạo ảnh", label_en: "Image", label_vi: "Tạo ảnh", order: 1 },
  { name: "Code Assistant", label_en: "Code Assistant", label_vi: "Code Assistant", order: 2 },
  { name: "Giáo dục", label_en: "Education", label_vi: "Giáo dục", order: 3 },
  { name: "Tài chính", label_en: "Finance", label_vi: "Tài chính", order: 4 },
  { name: "Y tế", label_en: "Health", label_vi: "Y tế", order: 5 },
  { name: "Tiện ích", label_en: "Utilities", label_vi: "Tiện ích", order: 6 },
  { name: "Sáng tạo", label_en: "Creative", label_vi: "Sáng tạo", order: 7 },
];

// ---------------------------------------------------------------------------
// 6. Seed function
// ---------------------------------------------------------------------------

async function seed() {
  console.log("=== Starting Firestore seed ===\n");

  // --- Seed apps ---
  console.log(`Seeding ${apps.length} apps into "apps" collection...`);

  const appBatch = db.batch();

  for (const app of apps) {
    const docRef = db.collection("apps").doc(app.slug);
    appBatch.set(docRef, app, { merge: true });
    console.log(`  [apps] Queued: ${app.slug} (${app.name})`);
  }

  await appBatch.commit();
  console.log(`  Done! ${apps.length} app documents written.\n`);

  // --- Seed blogs ---
  console.log(`Seeding ${blogs.length} blogs into "blogs" collection...`);

  const blogBatch = db.batch();

  for (const blog of blogs) {
    const docRef = db.collection("blogs").doc(blog.slug);
    blogBatch.set(docRef, blog, { merge: true });
    console.log(`  [blogs] Queued: ${blog.slug}`);
  }

  await blogBatch.commit();
  console.log(`  Done! ${blogs.length} blog documents written.\n`);

  // --- Seed categories ---
  console.log(`Seeding ${categories.length} categories into "categories" collection...`);

  const catBatch = db.batch();

  for (const cat of categories) {
    const docRef = db.collection("categories").doc();
    catBatch.set(docRef, cat);
    console.log(`  [categories] Queued: ${cat.name}`);
  }

  await catBatch.commit();
  console.log(`  Done! ${categories.length} category documents written.\n`);

  console.log("=== Firestore seed complete ===");
}

// ---------------------------------------------------------------------------
// 7. Run
// ---------------------------------------------------------------------------

seed()
  .then(() => {
    console.log("\nExiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
