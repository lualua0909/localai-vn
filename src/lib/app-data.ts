export interface AppDetail {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  rating: number;
  reviewsCount: string;
  category: string;
  author: string;
  icon: string;
  screenshots: string[];
  features: {
    title: string;
    description: string;
  }[];
  pricing: {
    plan: string;
    price: string;
    features: string[];
  }[];
  releaseDate?: string;
  views?: number;
  score?: number;
}

const defaultFeatures = [
  {
    title: "Tiếng Việt tối ưu",
    description: "Được huấn luyện đặc biệt cho ngôn ngữ và văn hoá Việt Nam."
  },
  {
    title: "Hiệu suất cao",
    description: "Xử lý tác vụ nhanh chóng với độ chính xác hàng đầu."
  },
  {
    title: "Dễ dàng tích hợp",
    description: "API đơn giản, tài liệu chi tiết cho nhà phát triển."
  }
];

const defaultPricing = [
  {
    plan: "Cơ bản",
    price: "Miễn phí",
    features: ["Tính năng cơ bản", "Hỗ trợ cộng đồng"]
  },
  {
    plan: "Chuyên nghiệp",
    price: "199.000đ/tháng",
    features: ["Tất cả tính năng", "Hỗ trợ 24/7", "Không giới hạn"]
  }
];

export const appData: Record<string, AppDetail> = {
  engagekit: {
    id: "engagekit",
    slug: "engagekit",
    name: "EngageKit",
    tagline: "The ultimate AI-powered LinkedIn engagement assistant",
    category: "Productivity",
    rating: 4.9,
    reviewsCount: "1.2K",
    author: "Unikorn Team",
    icon: "https://placehold.co/100x100/2563eb/white?text=EK",
    description: `
      <p>EngageKit boosts your LinkedIn presence by automating engagement strategies while keeping your interactions personalized and authentic.</p>
      <p class="mt-4">Never miss an opportunity to connect with key industry players. With EngageKit, you can streamline your networking process, track your growth, and become a thought leader in your niche.</p>
    `,
    screenshots: [
      "https://assets.aceternity.com/macbook-scroll.png",
      "https://assets.aceternity.com/linear.webp",
      "https://assets.aceternity.com/pro.png"
    ],
    features: [
      {
        title: "Smart Replies",
        description:
          "AI-generated replies that sound just like you, trained on your previous posts."
      },
      {
        title: "Analytics Dashboard",
        description:
          "Track your engagement metrics and watch your network grow in real-time."
      },
      {
        title: "Auto-Connect",
        description:
          "Intelligent connection requests to expand your network with relevant professionals."
      }
    ],
    pricing: [
      {
        plan: "Starter",
        price: "Free",
        features: ["50 AI replies/mo", "Basic Analytics", "1 User"]
      },
      {
        plan: "Pro",
        price: "$19/mo",
        features: [
          "Unlimited AI replies",
          "Advanced Analytics",
          "Priority Support"
        ]
      }
    ]
  },
  vietgpt: {
    id: "vietgpt",
    slug: "vietgpt",
    name: "VietGPT",
    tagline: "Chatbot AI #1 Việt Nam",
    category: "Chatbot",
    rating: 4.8,
    reviewsCount: "2.1K",
    author: "VietAI Team",
    icon: "https://placehold.co/100x100/0891b2/white?text=VG",
    description: `
      <p>Trải nghiệm chatbot AI tiếng Việt thông minh nhất, hỗ trợ đa ngữ cảnh. VietGPT được tối ưu hoá cho ngôn ngữ và văn hoá Việt Nam.</p>
    `,
    screenshots: [
      "https://assets.aceternity.com/demos/aceternity-ui-demo.png",
      "https://assets.aceternity.com/demos/algochurn.png"
    ],
    features: [
      {
        title: "Tiếng Việt tự nhiên",
        description: "Hiểu và phản hồi tiếng Việt với ngữ điệu tự nhiên nhất."
      },
      {
        title: "Hỗ trợ đa ngành",
        description:
          "Kiến thức chuyên sâu trong các lĩnh vực Y tế, Luật, và Giáo dục tại Việt Nam."
      }
    ],
    pricing: [
      {
        plan: "Cơ bản",
        price: "Miễn phí",
        features: ["100 tin nhắn/ngày", "Tốc độ tiêu chuẩn"]
      },
      {
        plan: "Nâng cao",
        price: "99.000đ/tháng",
        features: ["Không giới hạn", "Tốc độ cao", "Ưu tiên hỗ trợ"]
      }
    ]
  },
  pixelaistudio: {
    id: "pixelaistudio",
    slug: "pixelaistudio",
    name: "PixelAI Studio",
    tagline: "Sáng tạo hình ảnh không giới hạn",
    category: "Tạo ảnh",
    rating: 4.7,
    reviewsCount: "1.5K",
    author: "PixelLabs",
    icon: "https://placehold.co/100x100/8b5cf6/white?text=PS",
    description: `
      <p>Tạo ảnh sản phẩm chuyên nghiệp bằng AI trong 30 giây. PixelAI Studio giúp các nhà bán hàng và marketer tạo ra những hình ảnh quảng cáo ấn tượng mà không cần thuê studio đắt đỏ.</p>
    `,
    screenshots: [
      "https://assets.aceternity.com/demos/aceternity-ui-demo.png",
      "https://assets.aceternity.com/demos/algochurn.png"
    ],
    features: defaultFeatures,
    pricing: defaultPricing
  },
  codebuddyvn: {
    id: "codebuddyvn",
    slug: "codebuddyvn",
    name: "CodeBuddy VN",
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
    pricing: defaultPricing
  },
  edumentor: {
    id: "edumentor",
    slug: "edumentor",
    name: "EduMentor",
    tagline: "Gia sư AI cá nhân hoá",
    category: "Giáo dục",
    rating: 4.9,
    reviewsCount: "3.2K",
    author: "EduTech VN",
    icon: "https://placehold.co/100x100/f59e0b/white?text=EM",
    description:
      "<p>Gia sư AI 1 kèm 1, cá nhân hoá lộ trình học tập cho học sinh Việt Nam.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing
  },
  voiceaiviệt: {
    id: "voiceaiviệt",
    slug: "voiceaiviệt",
    name: "VoiceAI Việt",
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
    pricing: defaultPricing
  },
  docuscanai: {
    id: "docuscanai",
    slug: "docuscanai",
    name: "DocuScan AI",
    tagline: "OCR thông minh cho tiếng Việt",
    category: "Tiện ích",
    rating: 4.4,
    reviewsCount: "650",
    author: "ScanSoft",
    icon: "https://placehold.co/100x100/6366f1/white?text=DS",
    description:
      "<p>Số hoá tài liệu tiếng Việt nhanh chóng, hỗ trợ nhận diện chữ viết tay.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing
  },
  marketbot: {
    id: "marketbot",
    slug: "marketbot",
    name: "MarketBot",
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
    pricing: defaultPricing
  },
  healthcheckai: {
    id: "healthcheckai",
    slug: "healthcheckai",
    name: "HealthCheck AI",
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
    pricing: defaultPricing
  },
  finbot: {
    id: "finbot",
    slug: "finbot",
    name: "FinBot",
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
    pricing: defaultPricing
  },
  datasense: {
    id: "datasense",
    slug: "datasense",
    name: "DataSense",
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
    pricing: defaultPricing
  },
  translatevn: {
    id: "translatevn",
    slug: "translatevn",
    name: "TranslateVN",
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
    pricing: defaultPricing
  },
  storyai: {
    id: "storyai",
    slug: "storyai",
    name: "StoryAI",
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
    pricing: defaultPricing
  },
  legalaivn: {
    id: "legalaivn",
    slug: "legalaivn",
    name: "LegalAI VN",
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
    pricing: defaultPricing
  },
  farmsmart: {
    id: "farmsmart",
    slug: "farmsmart",
    name: "FarmSmart",
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
    pricing: defaultPricing
  },
  tutormath: {
    id: "tutormath",
    slug: "tutormath",
    name: "TutorMath",
    tagline: "Giải toán và giảng dạy bằng AI",
    category: "Giáo dục",
    rating: 4.8,
    reviewsCount: "1.8K",
    author: "MathGenius",
    icon: "https://placehold.co/100x100/06b6d4/white?text=TM",
    description: "<p>Giải toán chi tiết từng bước, từ cơ bản đến nâng cao.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing
  },
  photofixai: {
    id: "photofixai",
    slug: "photofixai",
    name: "PhotoFix AI",
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
    pricing: defaultPricing
  },
  chatdoc: {
    id: "chatdoc",
    slug: "chatdoc",
    name: "ChatDoc",
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
    pricing: defaultPricing
  },
  musicgenvn: {
    id: "musicgenvn",
    slug: "musicgenvn",
    name: "MusicGen VN",
    tagline: "Sáng tác nhạc bằng AI",
    category: "Sáng tạo",
    rating: 4.0,
    reviewsCount: "180",
    author: "SoundLab",
    icon: "https://placehold.co/100x100/a855f7/white?text=MG",
    description: "<p>Tạo giai điệu và bài hát mới mang âm hưởng Việt Nam.</p>",
    screenshots: [],
    features: defaultFeatures,
    pricing: defaultPricing
  },
  resumeai: {
    id: "resumeai",
    slug: "resumeai",
    name: "ResumeAI",
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
    pricing: defaultPricing
  },
  speechcoach: {
    id: "speechcoach",
    slug: "speechcoach",
    name: "SpeechCoach",
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
    pricing: defaultPricing
  }
};

export function getAppBySlug(slug: string): AppDetail | null {
  // Try direct match first
  if (appData[slug]) return appData[slug];

  // Fallback: try removing spaces from input slug if it wasn't already
  // or matching against URI decoded version
  const decoded = decodeURIComponent(slug);
  if (appData[decoded]) return appData[decoded];

  return null;
}

export function getRelatedApps(
  currentAppId: string,
  limit: number = 4
): AppDetail[] {
  const currentApp = appData[currentAppId];
  if (!currentApp) return [];

  const allApps = Object.values(appData).filter(
    (app) => app.id !== currentAppId
  );

  // 1. Same category
  const sameCategory = allApps.filter(
    (app) => app.category === currentApp.category
  );

  // 2. Others (fallback)
  const others = allApps.filter((app) => app.category !== currentApp.category);

  // Combine and slice
  return [...sameCategory, ...others].slice(0, limit);
}
