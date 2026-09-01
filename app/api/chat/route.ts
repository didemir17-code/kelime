import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API anahtarı bulunamadı.",
          text: "Merhaba! AI Öğretmen asistanını kullanabilmek için GEMINI_API_KEY yapılandırması gereklidir. Lütfen platform ayarlarından API anahtarınızı tanımlayın.",
        },
        { status: 200 }
      );
    }

    const body = await req.json();
    const { message, messages, currentWord } = body;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `Sen 6. sınıf seviyesinde (MEB müfredatı A1-A2) uzmanlaşmış, motive edici, nazik ve eğlenceli bir İngilizce kelime ve dil öğretmeni asistanısın.
Öğrencinin seviyesi: 6. sınıf (Ortaokul).
Temalar: School (Okul), Family & Friends (Aile ve Arkadaşlar), Hobbies & Free Time (Hobiler), Food & Drinks (Yiyecekler), Occupations (Meslekler), Weather & Emotions (Hava Durumu ve Duygular), Holidays (Tatiller), Bookworms (Kitap Kurtları).

KURALLAR:
1. Yanıtlarını 6. sınıf seviyesine uygun, sade, anlaşılır ve teşvik edici bir dille ver.
2. Gerektiğinde İngilizce kelimeleri büyük harfle yazıp yanına Türkçe anlamını ve basit telaffuzunu ekle (örnek: "EXPLORE - Keşfetmek 🔊 [ik-splor]").
3. Öğrenci bir kelime, cümle veya gramer sorarsa örnek cümlelerle açıkla.
4. Yanlış cevap verdiğinde nazikçe düzelt ve doğru kullanımı açıkla.
5. Öğrenciyi sürekli motive et (Harika gidiyorsun, Aferin!, vb.).
6. Çok uzun ve karmaşık paragraflar yazma, maddeler ve emojilerle eğlenceli hale getir.
${currentWord ? `Öğrencinin şu an çalıştığı kelime: ${currentWord.word} (${currentWord.meaning})` : ""}`;

    // Prepare contents
    let promptContents: string = "";
    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Build conversation string
      const conversationHistory = messages
        .map((m: { role: string; content: string }) => `${m.role === "user" ? "Öğrenci" : "Öğretmen"}: ${m.content}`)
        .join("\n");
      promptContents = `${conversationHistory}\nÖğrenci: ${message || ""}\nÖğretmen:`;
    } else {
      promptContents = message || "Merhaba öğretmenim!";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "Üzgünüm, şu anda yanıt oluşturamadım. Lütfen tekrar dene.";

    return NextResponse.json({
      text,
      success: true,
    });
  } catch (error: unknown) {
    console.error("Gemini Chat API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Sunucu hatası oluştu.";
    return NextResponse.json(
      {
        error: errorMessage,
        text: "Üzgünüm, şu anda yanıt verirken bir bağlantı sorunu oluştu. Lütfen tekrar dene!",
      },
      { status: 500 }
    );
  }
}
