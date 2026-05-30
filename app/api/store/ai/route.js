import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import authAdmin from "../../../../middlewares/authAdmin";
import { getOrCreateSystemStore } from "../../../../lib/systemStore";
import { openai } from "../../../../configs/openai";

const buildFallbackSuggestion = (productName = "", category = "", origin = "") => {
  const fallbackName = productName?.trim() || "Đặc sản miền Tây tuyển chọn";
  const categoryText = category?.trim() ? `thuộc danh mục ${category}` : "mang tinh thần đặc sản miền Tây";
  const originText = origin?.trim() ? `có nguồn gốc từ ${origin}` : "gắn với vùng đất giàu bản sắc";

  return {
    name: fallbackName,
    description: `<h2>Khởi nguồn của ${fallbackName}</h2><p>${fallbackName} là sản phẩm ${categoryText}, ${originText}, gợi mở một câu chuyện gần gũi nhưng giàu cảm xúc về ẩm thực và con người địa phương.</p><h2>Tỉ mỉ trong cách làm</h2><p>Từ khâu chọn lựa nguyên liệu đến cách chế biến, sản phẩm được nhấn mạnh bởi sự chỉn chu và tâm huyết, tạo nên cảm giác chân thật, đáng tin và giàu giá trị thủ công.</p><h2>Hương vị khiến người ta nhớ mãi</h2><p>Điểm cuốn hút của ${fallbackName} nằm ở hương vị hài hòa, dễ tạo ấn tượng ngay từ lần đầu thưởng thức và đủ khác biệt để người mua muốn quay lại thêm nhiều lần nữa.</p><h2>Một món quà đáng để giới thiệu</h2><p>Không chỉ phù hợp để thưởng thức mỗi ngày, ${fallbackName} còn là lựa chọn đáng cân nhắc khi bạn muốn gửi gắm một chút hương vị quê nhà tới người thân, bạn bè hay khách quý.</p>`,
    fallback: true,
  };
};

async function main(productName, category, origin, imageInput) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const messages = [
    {
      role: "system",
      content: `
        Bạn là copywriter tiếng Việt chuyên viết mô tả sản phẩm đặc sản vùng miền cho cửa hàng.

        Nhiệm vụ:
        - Dựa trên TÊN SẢN PHẨM, DANH MỤC, XUẤT XỨ và ẢNH sản phẩm.
        - Suy luận đây có thể là đặc sản vùng miền nào của Việt Nam (nếu không chắc, nêu theo hướng "gợi nhớ" hoặc "mang nét", không khẳng định tuyệt đối).
        - Viết mô tả theo phong cách storytelling, giàu hình ảnh, cảm xúc, tự nhiên, có tính marketing.

        Response ONLY with raw JSON (no code block, no markdown, no explanation). The JSON must strictly follow this schema:
        {
          "name": string,
          "description": string
        }

        Requirements for "description":
        - Return valid HTML only.
        - Include exactly 4 standout headings and 4 paragraphs.
        - Use this pattern: <h2>Heading 1</h2><p>Paragraph 1</p> repeated 4 times.
        - Nội dung cần có:
          1) Bối cảnh vùng miền/gốc gác sản phẩm
          2) Cách làm/chế biến/chọn nguyên liệu
          3) Hương vị và trải nghiệm khi dùng
          4) Giá trị cảm xúc + lời gợi mở mua hàng
        - Tổng độ dài tương đương một bài mô tả storytelling tầm trung.
        - Giọng văn: mộc mạc, tinh tế, chân thật, truyền cảm.
        - Không dùng markdown, không dùng code block.
        - Không thêm mục lục, không đánh số heading.
        - Không chèn emoji hoặc ký tự lạ.
        - Giữ nguyên tên sản phẩm trong nội dung.
        - Không bịa thông tin quá cụ thể nếu không có dữ liệu; ưu tiên ngôn ngữ an toàn kiểu "gợi nhớ", "mang hơi thở", "đậm chất".
      `,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Tên sản phẩm: "${productName}".
Danh mục: "${category}".
Xuất xứ: "${origin}".

Bạn hãy phân tích ảnh sản phẩm đính kèm và viết mô tả sản phẩm theo phong cách storytelling kể chuyện về món đặc sản vùng miền.
Yêu cầu bắt buộc: có đúng 4 heading và 4 đoạn văn, nội dung có chiều sâu cảm xúc và tính marketing, độ dài tương đương ví dụ mô tả sản phẩm "Thốt nốt đóng hộp".
Giữ nguyên tên sản phẩm trong trường "name".`,
        },
        {
          type: "image_url",
          image_url: { url: imageInput },
        },
      ],
    },
  ];

  let response;
  let attempts = 0;
  const maxAttempts = 3;
  const delays = [1000, 3000, 7000];

  while (true) {
    try {
      response = await openai.chat.completions.create({
        model: modelName,
        messages,
      });
      break;
    } catch (err) {
      const status = err?.status ?? err?.response?.status;
      if (status === 429 && attempts < maxAttempts - 1) {
        await sleep(delays[attempts]);
        attempts += 1;
        continue;
      }
      throw err;
    }
  }

  const raw = response.choices?.[0]?.message?.content || "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(request) {
  let payload = {};
  const startedAt = Date.now();

  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    await getOrCreateSystemStore();

    payload = await request.json();
    const { productName, category, origin, imageDataUrl, imageUrl } = payload;
    const imageInput = imageUrl || imageDataUrl;
    console.log("[AI_PRODUCT] request", {
      userId,
      hasProductName: Boolean(productName?.trim()),
      category,
      origin,
      hasImageUrl: Boolean(imageUrl),
      hasImageDataUrl: Boolean(imageDataUrl),
      imageInputPrefix: typeof imageInput === "string" ? imageInput.slice(0, 24) : null,
    });

    if (!productName?.trim()) return NextResponse.json({ error: "Missing product name" }, { status: 400 });
    if (!category?.trim() || !origin?.trim()) return NextResponse.json({ error: "Missing category or origin" }, { status: 400 });
    if (!imageInput || (typeof imageInput !== "string")) {
      return NextResponse.json({ error: "Missing image input for AI analysis" }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY on server" }, { status: 400 });
    }

    const result = await main(productName.trim(), category.trim(), origin.trim(), imageInput);
    console.log("[AI_PRODUCT] success", {
      userId,
      fallback: Boolean(result?.fallback),
      tookMs: Date.now() - startedAt,
    });
    return NextResponse.json({ ...result }, { status: 200 });
  } catch (error) {
    console.log("[AI_PRODUCT_ERROR]", {
      message: error?.message,
      code: error?.code,
      status: error?.status ?? error?.response?.status,
      tookMs: Date.now() - startedAt,
    });
    const status = error?.status ?? error?.response?.status;

    if (status === 429) {
      const fallbackResult = buildFallbackSuggestion(payload.productName, payload.category, payload.origin);
      return NextResponse.json(
        {
          ...fallbackResult,
          error: "AI đang quá tải hoặc đã hết quota. Hệ thống đã tạo gợi ý dự phòng.",
          providerError: error?.message || "Unknown AI provider error",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
