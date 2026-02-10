export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "ai-viet-nam-2025-xu-huong-va-co-hoi",
    title: "AI Việt Nam 2025: Xu hướng và cơ hội",
    description:
      "Tổng quan về thị trường AI Việt Nam, những xu hướng nổi bật và cơ hội cho các startup công nghệ trong năm 2025.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    author: "Minh Trần",
    date: "10 Th02, 2026",
    category: "Xu hướng",
    readTime: "8 phút đọc",
    content: `## Giới thiệu

Năm 2025 đánh dấu một bước ngoặt quan trọng cho ngành AI tại Việt Nam. Với sự phát triển mạnh mẽ của các mô hình ngôn ngữ lớn (LLM) và sự gia tăng đầu tư từ cả trong và ngoài nước, Việt Nam đang dần trở thành một trung tâm AI đáng chú ý trong khu vực Đông Nam Á.

Theo báo cáo mới nhất từ Google, Việt Nam nằm trong top 5 quốc gia có tốc độ áp dụng AI nhanh nhất Đông Nam Á, với hơn 60% doanh nghiệp vừa và lớn đã bắt đầu tích hợp AI vào quy trình kinh doanh.

## Những xu hướng nổi bật

### 1. LLM tiếng Việt

Một trong những xu hướng đáng chú ý nhất là sự phát triển của các mô hình ngôn ngữ lớn được tối ưu cho tiếng Việt. Các công ty như VinAI, FPT AI, và nhiều startup đã ra mắt các LLM có khả năng hiểu và sinh văn bản tiếng Việt chất lượng cao.

> "Chúng tôi tin rằng AI tiếng Việt sẽ là chìa khóa để số hóa toàn diện nền kinh tế Việt Nam trong thập kỷ tới." — CEO một startup AI hàng đầu

### 2. AI trong giáo dục

Giáo dục là lĩnh vực được hưởng lợi nhiều nhất từ AI tại Việt Nam. Các nền tảng gia sư AI, hệ thống chấm bài tự động, và công cụ cá nhân hóa lộ trình học tập đang ngày càng phổ biến.

- **Gia sư AI cá nhân**: Hỗ trợ 1-1 cho học sinh với chi phí thấp
- **Chấm bài tự động**: Giảm 70% thời gian chấm bài cho giáo viên
- **Lộ trình học tập**: Tùy chỉnh nội dung theo năng lực từng học sinh

### 3. Computer Vision trong nông nghiệp

Việt Nam, với nền nông nghiệp chiếm 12% GDP, đang chứng kiến làn sóng ứng dụng computer vision để phát hiện sâu bệnh, dự báo mùa vụ, và tối ưu hóa tưới tiêu.

## Cơ hội cho startup

Thị trường AI Việt Nam dự kiến đạt giá trị **500 triệu USD** vào năm 2026. Đây là thời điểm vàng cho các startup AI với những lợi thế:

1. **Chi phí nhân lực cạnh tranh** — Kỹ sư AI Việt Nam có trình độ cao với mức lương hợp lý hơn so với các nước phát triển
2. **Thị trường nội địa lớn** — 100 triệu dân với tỷ lệ sử dụng smartphone trên 70%
3. **Chính sách hỗ trợ** — Chính phủ đã ban hành chiến lược AI quốc gia với nhiều ưu đãi cho startup

## Kết luận

AI tại Việt Nam không còn là xu hướng mà đã trở thành thực tế. Những ai nắm bắt được cơ hội này sẽ là người dẫn đầu trong kỷ nguyên số hóa tiếp theo của đất nước. LocalAI tự hào là nền tảng kết nối và giới thiệu những sản phẩm AI xuất sắc nhất từ cộng đồng developer Việt Nam.`,
  },
  {
    slug: "xay-dung-chatbot-tieng-viet-voi-llm",
    title: "Xây dựng Chatbot tiếng Việt với LLM",
    description:
      "Hướng dẫn chi tiết cách fine-tune mô hình ngôn ngữ lớn cho tiếng Việt, từ chuẩn bị dữ liệu đến triển khai.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80",
    author: "Hương Nguyễn",
    date: "08 Th02, 2026",
    category: "Hướng dẫn",
    readTime: "12 phút đọc",
    content: `## Giới thiệu

Xây dựng chatbot tiếng Việt chất lượng cao là một thách thức đặc biệt do đặc thù ngôn ngữ. Bài viết này sẽ hướng dẫn bạn từng bước để fine-tune một LLM cho tiếng Việt, từ việc chuẩn bị dataset đến triển khai production.

## Chuẩn bị dữ liệu

Chất lượng dữ liệu là yếu tố quyết định thành công. Bạn cần:

- **Dữ liệu hội thoại**: Thu thập từ các nguồn công khai, forum, FAQ
- **Dữ liệu chuyên ngành**: Tùy thuộc vào domain chatbot phục vụ
- **Dữ liệu đánh giá**: Bộ test riêng để kiểm tra chất lượng

> Tip: Bắt đầu với ít nhất 10.000 cặp câu hỏi-trả lời chất lượng cao thay vì hàng triệu mẫu chất lượng thấp.

### Xử lý tiếng Việt

Tiếng Việt có nhiều đặc thù cần xử lý:

1. **Tách từ (Word Segmentation)**: Sử dụng VnCoreNLP hoặc Underthesea
2. **Chuẩn hóa Unicode**: Đảm bảo sử dụng NFC normalization
3. **Xử lý viết tắt**: "k" → "không", "dc" → "được", "r" → "rồi"

## Fine-tuning

### Chọn base model

Đề xuất các model phù hợp cho tiếng Việt:

- **Llama 3.1 8B** — Cân bằng giữa performance và chi phí
- **Mistral 7B** — Tốc độ inference nhanh
- **Qwen2 7B** — Hỗ trợ tốt cho ngôn ngữ Đông Á

### Cấu hình training

Sử dụng LoRA (Low-Rank Adaptation) để giảm chi phí training:

- Learning rate: 2e-4
- Batch size: 4-8 (tùy GPU)
- LoRA rank: 64
- Epochs: 3-5

## Triển khai

Sau khi fine-tune, bạn có thể triển khai chatbot với nhiều lựa chọn:

- **vLLM**: Inference server hiệu suất cao
- **TGI (Text Generation Inference)**: Giải pháp của Hugging Face
- **Ollama**: Đơn giản cho local deployment

## Kết luận

Xây dựng chatbot tiếng Việt ngày nay đã dễ dàng hơn rất nhiều nhờ các công cụ open-source. Điều quan trọng nhất vẫn là chất lượng dữ liệu và việc đánh giá liên tục. Hãy bắt đầu nhỏ, lặp lại nhanh, và mở rộng dần.`,
  },
  {
    slug: "so-sanh-cac-nen-tang-ai-as-a-service-tai-viet-nam",
    title: "So sánh các nền tảng AI-as-a-Service tại Việt Nam",
    description:
      "Đánh giá chi tiết các dịch vụ AI cloud phổ biến: FPT AI, VinAI, Viettel AI và các giải pháp quốc tế.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    author: "Đức Phạm",
    date: "05 Th02, 2026",
    category: "So sánh",
    readTime: "10 phút đọc",
    content: `## Giới thiệu

Khi doanh nghiệp Việt Nam muốn tích hợp AI, câu hỏi đầu tiên thường là: nên dùng dịch vụ nào? Bài viết này so sánh chi tiết các nền tảng AI-as-a-Service phổ biến nhất tại Việt Nam.

## Các nền tảng nội địa

### FPT AI Platform

FPT AI là nền tảng AI lâu đời nhất tại Việt Nam với đầy đủ tính năng:

- **Speech-to-Text**: Độ chính xác 95%+ cho tiếng Việt
- **NLP**: Phân tích cảm xúc, tách thực thể, phân loại văn bản
- **Chatbot Builder**: Giao diện kéo-thả, không cần code
- **Giá**: Từ miễn phí đến enterprise tùy chỉnh

### VinAI

VinAI tập trung vào nghiên cứu và ứng dụng AI cấp cao:

- **Computer Vision**: Nhận dạng khuôn mặt, OCR tiếng Việt
- **LLM**: Mô hình ngôn ngữ lớn tiếng Việt PhoGPT
- **Ưu điểm**: Nghiên cứu top-tier, paper tại NeurIPS, ICML

### Viettel AI

Viettel AI hướng đến giải pháp cho chính phủ và doanh nghiệp lớn:

- **eKYC**: Xác thực danh tính điện tử
- **Smart City**: Giám sát giao thông, an ninh
- **Giá**: Dành cho enterprise, cần liên hệ

## Giải pháp quốc tế

> Các dịch vụ quốc tế có ưu thế về quy mô nhưng thường thiếu tối ưu cho tiếng Việt và có chi phí cao hơn khi xử lý dữ liệu lớn.

- **OpenAI API**: Mạnh nhất cho text generation, nhưng tiếng Việt chưa tối ưu
- **Google Cloud AI**: Đầy đủ nhất, hỗ trợ tiếng Việt tốt
- **AWS AI/ML**: Linh hoạt nhất cho custom training

## Kết luận

Không có giải pháp "one size fits all". Lựa chọn phụ thuộc vào nhu cầu cụ thể, ngân sách, và yêu cầu về tiếng Việt của doanh nghiệp bạn.`,
  },
  {
    slug: "computer-vision-ung-dung-trong-nong-nghiep-viet-nam",
    title: "Computer Vision ứng dụng trong nông nghiệp Việt Nam",
    description:
      "Câu chuyện về những startup Việt đang dùng thị giác máy tính để cách mạng hoá ngành nông nghiệp.",
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80",
    author: "Lan Lê",
    date: "01 Th02, 2026",
    category: "Case Study",
    readTime: "7 phút đọc",
    content: `## Giới thiệu

Nông nghiệp Việt Nam đang trải qua cuộc cách mạng công nghệ. Computer Vision — khả năng máy tính "nhìn" và phân tích hình ảnh — đang mở ra những cơ hội chưa từng có cho ngành nông nghiệp vốn chiếm 12% GDP cả nước.

## Ứng dụng thực tế

### Phát hiện sâu bệnh

Startup AgriVision (TP.HCM) đã phát triển ứng dụng cho phép nông dân chụp ảnh lá cây và nhận kết quả chẩn đoán sâu bệnh trong vài giây:

- Độ chính xác: 92% trên 50 loại bệnh phổ biến
- Hỗ trợ: Lúa, cà phê, cao su, tiêu
- Người dùng: 50.000+ nông dân tại ĐBSCL

> "Trước đây tôi phải chờ cán bộ khuyến nông xuống, giờ chỉ cần chụp ảnh là biết cây bị gì." — Một nông dân tại Cần Thơ

### Phân loại nông sản

AI giúp phân loại trái cây theo kích thước, màu sắc và chất lượng tự động:

1. **Giảm 80% nhân công** cho khâu phân loại
2. **Tăng 30% giá trị** nhờ phân loại chính xác
3. **Hoạt động 24/7** không nghỉ

### Giám sát mùa vụ bằng drone

Kết hợp drone với AI để theo dõi tình trạng cây trồng trên diện rộng, phát hiện vùng thiếu nước hoặc dinh dưỡng sớm.

## Thách thức

- **Dữ liệu**: Thiếu dataset chuẩn cho cây trồng Việt Nam
- **Hạ tầng**: Kết nối internet ở nông thôn còn hạn chế
- **Chi phí**: Nông dân nhỏ lẻ khó tiếp cận công nghệ

## Kết luận

Computer Vision trong nông nghiệp Việt Nam mới chỉ ở giai đoạn đầu nhưng tiềm năng là rất lớn. Với sự hỗ trợ từ chính phủ và cộng đồng công nghệ, đây sẽ là lĩnh vực bùng nổ trong vài năm tới.`,
  },
  {
    slug: "prompt-engineering-cho-nguoi-viet",
    title: "Prompt Engineering cho người Việt",
    description:
      "Kỹ thuật viết prompt hiệu quả bằng tiếng Việt, tối ưu kết quả từ ChatGPT, Claude và các LLM phổ biến.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
    author: "Tuấn Vũ",
    date: "28 Th01, 2026",
    category: "Hướng dẫn",
    readTime: "9 phút đọc",
    content: `## Giới thiệu

Prompt Engineering — nghệ thuật viết câu lệnh cho AI — là kỹ năng thiết yếu trong thời đại LLM. Nhưng viết prompt bằng tiếng Việt có những đặc thù riêng cần lưu ý.

## Nguyên tắc cơ bản

### 1. Rõ ràng và cụ thể

Thay vì:
- ❌ "Viết bài về AI"

Hãy viết:
- ✅ "Viết bài blog 800 từ về xu hướng AI trong giáo dục Việt Nam 2025, dành cho đối tượng là giáo viên phổ thông, giọng văn chuyên nghiệp nhưng dễ hiểu"

### 2. Cung cấp ngữ cảnh

> Luôn cung cấp đủ ngữ cảnh để AI hiểu bạn muốn gì. Đặc biệt với tiếng Việt, cùng một từ có thể mang nhiều nghĩa khác nhau tùy ngữ cảnh.

### 3. Chia nhỏ task phức tạp

Thay vì yêu cầu AI làm mọi thứ trong một prompt, hãy chia thành nhiều bước:

1. **Bước 1**: Phân tích vấn đề
2. **Bước 2**: Đề xuất giải pháp
3. **Bước 3**: Chi tiết hóa giải pháp được chọn

## Kỹ thuật nâng cao

### Few-shot prompting

Cung cấp 2-3 ví dụ mẫu để AI hiểu pattern bạn mong muốn. Đặc biệt hữu ích khi cần output theo format cụ thể.

### Chain-of-thought

Yêu cầu AI "suy nghĩ từng bước" trước khi đưa ra câu trả lời. Rất hiệu quả cho bài toán logic và phân tích.

### Role-playing

Gán vai trò cho AI: "Bạn là một chuyên gia marketing 10 năm kinh nghiệm tại thị trường Việt Nam..."

## Mẹo cho tiếng Việt

- **Dùng tiếng Việt rõ ràng**: Tránh viết tắt, lóng
- **Chỉ định giọng văn**: Trang trọng, thân thiện, chuyên nghiệp
- **Mix Anh-Việt khi cần**: Thuật ngữ kỹ thuật nên giữ tiếng Anh

## Kết luận

Prompt Engineering không phải là "hack" mà là kỹ năng giao tiếp hiệu quả với AI. Càng rõ ràng, cụ thể, và có cấu trúc, kết quả AI trả về càng tốt.`,
  },
  {
    slug: "cong-dong-ai-viet-nam-nhin-lai-2025",
    title: "Cộng đồng AI Việt Nam: Nhìn lại 2025",
    description:
      "Tổng kết một năm phát triển mạnh mẽ của cộng đồng AI Việt — các sự kiện, sản phẩm nổi bật và những con người truyền cảm hứng.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    author: "Mai Anh",
    date: "25 Th01, 2026",
    category: "Cộng đồng",
    readTime: "6 phút đọc",
    content: `## Giới thiệu

Năm 2025 là một năm đáng nhớ cho cộng đồng AI Việt Nam. Từ những sự kiện quy mô lớn đến sự ra mắt của hàng trăm sản phẩm AI mới, cộng đồng đã chứng minh rằng người Việt hoàn toàn có thể tạo ra những sản phẩm AI đẳng cấp quốc tế.

## Sự kiện nổi bật

### Vietnam AI Summit 2025

Sự kiện AI lớn nhất Việt Nam với hơn 3.000 người tham dự:

- 50+ diễn giả từ Google, Meta, VinAI, FPT
- 30 startup AI trưng bày sản phẩm
- Demo Day với giải thưởng 500 triệu đồng

### AI Hackathon Series

Chuỗi hackathon trải dài cả năm với các chủ đề:

1. **Q1**: AI cho giáo dục
2. **Q2**: AI cho y tế
3. **Q3**: AI cho nông nghiệp
4. **Q4**: AI cho fintech

## Sản phẩm nổi bật

> Năm 2025, cộng đồng LocalAI đã ghi nhận hơn 300 sản phẩm AI mới từ developer Việt Nam — tăng 150% so với năm trước.

Một số sản phẩm được yêu thích nhất:

- **VietGPT**: Chatbot AI tiếng Việt #1
- **PixelAI Studio**: Công cụ tạo ảnh bằng AI
- **CodeBuddy VN**: Trợ lý lập trình thông minh
- **EduMentor**: Gia sư AI cho học sinh Việt

## Cộng đồng

Cộng đồng AI Việt Nam đã phát triển vượt bậc:

- **Discord**: 15.000+ thành viên
- **Meetup hàng tháng**: 12 thành phố
- **Open-source contributions**: 500+ repository

## Nhìn về 2026

Với đà phát triển hiện tại, chúng tôi tin rằng 2026 sẽ là năm bùng nổ thực sự. LocalAI cam kết tiếp tục là cầu nối, giúp mọi sản phẩm AI Việt Nam tìm được đúng người dùng và đúng cơ hội.`,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
