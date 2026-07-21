import type { BlogArticle } from "./blog";

// كل هذا يتولد من بيانات حقيقية بقاعدة البيانات وقت الطلب — بدون أي كتابة
// يدوية أو استدعاء API خارجي. الهدف: محتوى يخدم السيو التقليدي (كلمات دلالية،
// إجابة مباشرة أعلى الصفحة، أسئلة شائعة بصيغة الأسئلة الحقيقية اللي يبحث
// بيها الناس) ومحركات البحث بالذكاء الاصطناعي (AI Overviews / ChatGPT
// Search) اللي تفضّل حقائق مباشرة برقم ومصدر بدل الكلام الإنشائي.

export type ArticleRow = {
  id: number;
  name: string;
  brand: string;
  size: string | null;
  cheapest: string;
  savings: string | null;
  offersCount: number;
  cheapestStore?: { name: string; offerId: number } | null;
};

export type ArticleStats = {
  productsCount: number;
  brandsCount: number;
  cheapestPrice: number;
  cheapestProduct: ArticleRow | null;
  mostExpensivePrice: number;
  avgPrice: number;
  maxSavings: number;
  topStoreName: string | null; // المتجر الأكثر تكراراً كأرخص خيار
};

export function computeStats(rows: ArticleRow[]): ArticleStats {
  const prices = rows.map((r) => Number(r.cheapest)).filter((n) => !Number.isNaN(n));
  const brands = new Set(rows.map((r) => r.brand).filter(Boolean));
  const savings = rows.map((r) => Number(r.savings ?? 0));
  const storeCounts = new Map<string, number>();
  for (const r of rows) {
    if (!r.cheapestStore) continue;
    storeCounts.set(r.cheapestStore.name, (storeCounts.get(r.cheapestStore.name) ?? 0) + 1);
  }
  let topStoreName: string | null = null;
  let topCount = 0;
  for (const [name, count] of storeCounts) {
    if (count > topCount) {
      topCount = count;
      topStoreName = name;
    }
  }

  const cheapestProduct =
    rows.length > 0
      ? rows.reduce((min, r) => (Number(r.cheapest) < Number(min.cheapest) ? r : min), rows[0])
      : null;

  return {
    productsCount: rows.length,
    brandsCount: brands.size,
    cheapestPrice: prices.length ? Math.min(...prices) : 0,
    cheapestProduct,
    mostExpensivePrice: prices.length ? Math.max(...prices) : 0,
    avgPrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
    maxSavings: savings.length ? Math.max(...savings) : 0,
    topStoreName,
  };
}

// "لـ" + "ال" التعريف تندمج بالعربي الفصيح إلى "لل" (لـ + العناية = للعناية)
function withLam(subject: string): string {
  return subject.startsWith("ال") ? `لل${subject.slice(2)}` : `ل${subject}`;
}

// الجواب المباشر أعلى المقال — أول ١٥٠ حرف تقريباً، بصيغة حقيقة مباشرة
// برقم (هذا اللي يلتقطه Google Featured Snippet و AI Overviews)
export function buildDirectAnswer(article: BlogArticle, stats: ArticleStats): string {
  const subject = article.type === "category" ? article.subjectName : `منتجات ${article.subjectName}`;
  if (!stats.cheapestProduct) {
    return `ما زلنا نجمع أسعار ${subject} — تابعينا للتحديثات.`;
  }
  const price = stats.cheapestPrice.toFixed(2);
  const parts = [`أرخص سعر ${withLam(subject)} في السعودية اليوم ${price} ريال`];
  if (stats.topStoreName) parts.push(`من ${stats.topStoreName}`);
  if (stats.maxSavings > 0) {
    parts.push(`— فرق يوفّر حتى ${stats.maxSavings.toFixed(0)} ريال مقارنة بأغلى سعر لنفس المنتج`);
  }
  return parts.join(" ") + ".";
}

export function buildFAQ(
  article: BlogArticle,
  stats: ArticleStats
): { question: string; answer: string }[] {
  const subject = article.type === "category" ? article.subjectName : `منتجات ${article.subjectName}`;
  const faqs: { question: string; answer: string }[] = [];

  if (stats.cheapestProduct) {
    faqs.push({
      question: `ما هو أرخص سعر ${withLam(subject)} في السعودية؟`,
      answer: `أرخص سعر حالياً ${stats.cheapestPrice.toFixed(2)} ريال${stats.topStoreName ? ` من ${stats.topStoreName}` : ""}، لمنتج ${stats.cheapestProduct.name}. الأسعار تتحدث يومياً وقد تتغير.`,
    });
  }

  faqs.push({
    question: `كم عدد المنتجات المقارنة ضمن ${subject}؟`,
    answer:
      article.type === "category"
        ? `نقارن حالياً ${stats.productsCount} منتج من ${stats.brandsCount} ماركة مختلفة ضمن هذه الفئة.`
        : `نقارن حالياً ${stats.productsCount} منتج من ماركة ${article.subjectName}.`,
  });

  if (stats.topStoreName) {
    faqs.push({
      question: `أي متجر غالباً الأرخص ${withLam(subject)}؟`,
      answer: `بناءً على المقارنة الحالية، ${stats.topStoreName} يقدّم أرخص سعر لأكبر عدد من المنتجات ضمن هذه القائمة — لكن هذا يختلف من منتج لآخر، لذا قارني قبل كل عملية شراء.`,
    });
  }

  if (stats.maxSavings > 0) {
    faqs.push({
      question: `كم ممكن أوفّر لو قارنت الأسعار قبل الشراء؟`,
      answer: `فرق السعر بين أرخص وأغلى متجر لنفس المنتج يوصل أحياناً إلى ${stats.maxSavings.toFixed(0)} ريال — لهذا مقارنة السعر قبل الشراء توفر عليك فعلياً.`,
    });
  }

  faqs.push({
    question: "هل الأسعار المعروضة شاملة التوصيل؟",
    answer:
      "الأسعار المعروضة هي سعر المنتج بصفحة المتجر الرسمية وقت آخر سحب — تكلفة التوصيل ورسوم إضافية (إن وجدت) تظهر بصفحة الدفع بموقع المتجر نفسه.",
  });

  faqs.push({
    question: "كل متى تتحدث الأسعار بهذه الصفحة؟",
    answer:
      "نسحب الأسعار آلياً من صفحات المتاجر الرسمية مرة يومياً على الأقل، ونسجل تاريخ كل تغيّر سعر حتى تعرفي إن كان العرض الحالي حقيقياً أو مؤقتاً.",
  });

  return faqs;
}

// دليل شراء ثابت لكل فئة — نصائح حقيقية ومحددة، مو كلام عام
export const CATEGORY_BUYING_GUIDE: Record<string, string[]> = {
  skincare: [
    "حددي نوع بشرتك أولاً (دهنية، جافة، مختلطة، حساسة) — نفس المنتج ممكن يناسب بشرة ويضر ثانية.",
    "رتّبي روتينك: تنظيف ← تونر ← سيروم ← مرطب ← واقي شمس (نهاراً فقط).",
    "تجنبي الجمع بين فيتامين سي والريتينول بنفس الروتين — استخدمي كل واحد بوقت مختلف من اليوم.",
    "واقي الشمس ضروري يومياً بغض النظر عن الطقس أو وجود سحاب.",
  ],
  "hair-care": [
    "حددي نوع شعرك وفروة رأسك (دهنية، جافة، تساقط، قشرة) قبل اختيار الشامبو.",
    "الشعر المصبوغ أو المعالج كيميائياً يحتاج منتجات خالية من الكبريتات (Sulfate-free).",
    "بلسم/ماسك مرة أسبوعياً على الأقل يقلل التقصف بشكل ملحوظ.",
    "لا تكرري غسل الشعر يومياً إلا لو فروة رأسك دهنية جداً — يجفف الشعر مع الوقت.",
  ],
  "body-care": [
    "أفضل وقت لترطيب الجسم هو مباشرة بعد الاستحمام والبشرة لسه رطبة — يحبس الرطوبة أفضل.",
    "لعلامات التمدد وتفتيح البشرة، دوري على مكونات مثل حمض الجليكوليك أو زبدة الشيا الحقيقية.",
    "الصابون العادي يجفف البشرة — غسول الجسم الكريمي أفضل للاستخدام اليومي.",
  ],
  "oral-care": [
    "معجون الأسنان بالفلورايد ضروري للوقاية من التسوس — تأكدي من وجوده بالمكونات.",
    "بدّلي فرشاة الأسنان كل 3 أشهر أو أول ما يتفتح الشعر.",
    "غسول الفم لا يعوّض التنظيف بالفرشاة والخيط، هو إضافة فقط.",
  ],
  "lip-care": [
    "دوري على مرطب شفاه فيه SPF لو تتعرضين للشمس بشكل يومي.",
    "الشفاه المتشققة تحتاج مكونات مرطبة زي زبدة الشيا أو الفازلين، بعيداً عن المنثول اللي يجفف مع الاستخدام الطويل.",
  ],
  "eye-care": [
    "منطقة العين حساسة جداً — جربي أي منتج جديد على منطقة صغيرة قبل الاستخدام الكامل.",
    "الهالات السوداء والانتفاخ لهم منتجات مختلفة — تأكدي إن المنتج يعالج مشكلتك تحديداً.",
  ],
  "hand-care": [
    "الترطيب المتكرر خصوصاً بعد التعقيم أو غسل اليدين يمنع الجفاف والتشقق.",
    "كريمات اليد بمكونات مثل اليوريا (Urea) فعالة أكثر للجفاف الشديد.",
  ],
  "foot-care": [
    "التشقق بالكعب يحتاج كريم مرطب مركّز يُستخدم ليلاً مع جوارب قطنية لأفضل نتيجة.",
    "منتجات فيها يوريا أو حمض الساليسيليك تساعد على تقشير الجلد السميك بأمان.",
  ],
  "women-care": [
    "اختاري منتجات معتمدة طبياً ومناسبة للاستخدام اليومي الحساس، وتحققي من المكونات إذا كانت بشرتك حساسة.",
  ],
  "men-care": [
    "بعد الحلاقة، رطبي البشرة فوراً بمنتج خفيف سريع الامتصاص لتقليل التهيج.",
    "بشرة الوجه للرجال غالباً أكثر دهنية — دوري على منتجات خفيفة القوام (Non-comedogenic).",
  ],
  "baby-care": [
    "منتجات بشرة الأطفال لازم تكون خالية من العطور والكبريتات قدر الإمكان.",
    "جربي أي منتج جديد على منطقة صغيرة من جلد الطفل وانتظري 24 ساعة قبل الاستخدام الكامل.",
  ],
};

export const BRAND_BUYING_GUIDE = [
  "قارني السعر بين المتاجر دايماً قبل الشراء — نفس المنتج بالضبط ممكن يفرق سعره بين متجر وآخر بأكثر من 20٪.",
  "تأكدي من تاريخ الصلاحية والحجم المطابق لاحتياجك قبل إضافة المنتج للسلة.",
  "لو المنتج غير متوفر بمتجرك المفضل، شوفي باقي المتاجر بنفس الصفحة بدل ما تدوري بنفسك.",
];
