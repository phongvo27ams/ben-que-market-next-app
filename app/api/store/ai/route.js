import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import authSeller from "../../../../middlewares/authSeller";
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

async function main(productName, category, origin) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const messages = [
    {
      role: "system",
      content: `
        You are a Vietnamese e-commerce copywriter.
        Write a short but compelling marketing storytelling article in Vietnamese.

        Response ONLY with raw JSON (no code block, no markdown, no explanation). The JSON must strictly follow this schema:
        {
          "name": string,
          "description": string
        }

        Requirements for "description":
        - Return valid HTML only.
        - Include exactly 4 standout headings and 4 paragraphs.
        - Use this pattern: <h2>Heading 1</h2><p>Paragraph 1</p> repeated 4 times.
        - Focus on origin, crafting process, flavor, and emotional appeal.
        - Keep the tone vivid, natural, persuasive, and marketing-friendly.
      `,
    },
    {
      role: "user",
      content: `Tên sản phẩm: "${productName}".
Danh mục: "${category}".
Xuất xứ: "${origin}".

Bạn hãy viết một bài Marketing ngắn như một storytelling giới thiệu về nguồn gốc, cách làm ra món, hương vị thật cuốn hút, gồm có 4 đoạn văn và 4 heading nổi bật cho sản phẩm.
Giữ nguyên tên sản phẩm trong trường "name".`,
    },
  ];

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
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

  const raw = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse JSON response from AI");
  }
}

export async function POST(request) {
  let payload = {};

  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    payload = await request.json();
    const { productName, category, origin } = payload;

    if (!productName?.trim()) {
      return NextResponse.json({ error: "Missing product name" }, { status: 400 });
    }

    if (!category?.trim() || !origin?.trim()) {
      return NextResponse.json({ error: "Missing category or origin" }, { status: 400 });
    }

    const result = await main(productName.trim(), category.trim(), origin.trim());
    return NextResponse.json({ ...result }, { status: 200 });
  } catch (error) {
    console.log("[AI_PRODUCT_ERROR]", error);
    const status = error?.status ?? error?.response?.status;

    if (status === 429) {
      const fallbackResult = buildFallbackSuggestion(payload.productName, payload.category, payload.origin);
      return NextResponse.json(
        {
          ...fallbackResult,
          error: "AI đang quá tải hoặc đã hết quota. Hệ thống đã tạo gợi ý dự phòng.",
          providerError:
            error?.message ||
            error?.response?.data?.error?.message ||
            error?.response?.data?.error ||
            "Unknown AI provider error",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
