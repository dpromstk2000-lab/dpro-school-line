// =========================================================
// STEP SCHOOL-NEXT-9
// DPRO 学習塾・習い事 LINE
// config.js 完全版
// 作成日：20260709
//
// 役割：
// GitHub Pages 側の各画面から共通で読み込む設定ファイル。
// Service Role Key や Supabase Key は絶対に置かない。
// 画面は Cloudflare Worker API だけを呼び出す。
// =========================================================

window.DPRO_SCHOOL_CONFIG = {
  version: "STEP SCHOOL-NEXT-9",
  serviceName: "DPRO 学習塾・習い事 LINE",
  serviceSubtitle: "学習塾・習い事向け 体験予約・出席・振替・保護者連絡システム",

  shopCode: "dpro_school_demo",
  shopName: "DPROスクール",
  adminCodeStorageKey: "dpro_school_admin_code",
  timezone: "Asia/Tokyo",

  // Cloudflare Worker API
  // Worker名：dpro-school-line-api
  apiBaseUrl: "https://dpro-school-line-api.dpromstk2000.workers.dev",

  // GitHub Pages
  pagesBaseUrl: "https://dpromstk2000-lab.github.io/dpro-school-line/",

  // 管理コードは画面に固定表示しない。
  // 入力された管理コードを localStorage に保存して使う。
  defaultAdminCodeHint: "1234",

  demoStudent: {
    studentName: "テスト 太郎",
    studentNo: "SCHOOL-DEMO-999",
    guardianName: "テスト 保護者",
    phone: "090-9999-0000"
  },
  nextAudit: {
    expectedWorkerVersion: "STEP-SCHOOL-NEXT-1-R1-WORKER-SECURITY-20260723",
    fileSizeWarnBytes: 240000,
    loadWarnMs: 2500,
    expectedPageMarkers: {
      system: "STEP SCHOOL-NEXT-9 / system-check.html",
      index: "STEP SCHOOL-NEXT-7 / index.html",
      member: "STEP SCHOOL-NEXT-8 / member.html",
      owner: "STEP SCHOOL-NEXT-8 / owner.html",
      ipad: "STEP SCHOOL-NEXT-6 / owner-ipad.html"
    }
  },


  endpoints: {
    health: "/api/health",

    publicConfig: "/api/public/config",
    lessonOptions: "/api/public/lesson-options",
    trialReservations: "/api/public/trial-reservations",
    absence: "/api/public/absence",
    makeupRequest: "/api/public/makeup-request",

    memberProfile: "/api/member/profile",

    adminDemoPrepare: "/api/admin/demo/prepare",
    adminDashboard: "/api/admin/dashboard",
    adminDay: "/api/admin/day",
    adminSearch: "/api/admin/search",
    adminStudentDetail: "/api/admin/student-detail",

    adminManualCreate: "/api/admin/lessons/manual-create",
    adminPhoneCreate: "/api/admin/lessons/phone-create",
    adminWalkinCreate: "/api/admin/lessons/walkin-create",
    adminLessonStatus: "/api/admin/lessons/status",

    adminRequestStatus: "/api/admin/requests/status",
    adminTaskStatus: "/api/admin/tasks/status",
    adminUseTicket: "/api/admin/tickets/use",
    adminMessageLogCopy: "/api/admin/messages/log-copy"
  },

  labels: {
    trial: "体験予約",
    regular: "通常授業",
    makeup: "振替授業",
    absence: "欠席連絡",
    studentCard: "生徒証",
    guardian: "保護者",
    teacher: "講師",
    ticket: "チケット",
    makeupRemain: "振替残数"
  },

  statusLabels: {
    requested: "申込",
    reserved: "予約済み",
    confirmed: "確認済み",
    checked_in: "出席",
    in_class: "授業中",
    completed: "授業完了",
    absent: "欠席",
    cancelled: "取消",
    no_show: "無断欠席",
    makeup_requested: "振替希望",
    makeup_done: "振替済み"
  },

  requestLabels: {
    trial_request: "体験希望",
    absence: "欠席連絡",
    makeup_request: "振替希望",
    contact: "問い合わせ",
    payment_question: "月謝確認",
    course_question: "コース相談",
    join_followup: "入会フォロー",
    other: "その他"
  },

  taskLabels: {
    trial_followup: "体験フォロー",
    absence_reply: "欠席返信",
    makeup_reply: "振替返信",
    payment_check: "月謝確認",
    parent_contact: "保護者連絡",
    teacher_share: "講師共有",
    lesson_prepare: "授業準備",
    ticket_warning: "残数確認",
    other: "その他"
  },

  coursePresets: [
    { code: "trial_math", label: "体験授業：小学生算数" },
    { code: "regular_english", label: "中学生英語コース" },
    { code: "programming", label: "プログラミング教室" },
    { code: "piano_ticket", label: "ピアノ個別レッスン" },
    { code: "makeup", label: "振替授業" }
  ],

  teacherPreferenceOptions: [
    { value: "any", label: "おまかせ" },
    { value: "same", label: "前回と同じ先生" },
    { value: "specific", label: "先生を選ぶ" }
  ]
};

// 旧コードや画面側で CONFIG として参照しやすいように別名も用意
window.CONFIG = window.DPRO_SCHOOL_CONFIG;


// =========================================================
// 共通ユーティリティ
// =========================================================

window.DPRO_SCHOOL_UTILS = {
  apiUrl(path, params = {}) {
    const config = window.DPRO_SCHOOL_CONFIG;
    const base = String(config.apiBaseUrl || "").replace(/\/+$/, "");
    const endpoint = String(path || "");
    const url = new URL(base + endpoint);

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  },

  getAdminCode() {
    const config = window.DPRO_SCHOOL_CONFIG;
    return localStorage.getItem(config.adminCodeStorageKey) || "";
  },

  saveAdminCode(code) {
    const config = window.DPRO_SCHOOL_CONFIG;
    localStorage.setItem(config.adminCodeStorageKey, String(code || "").trim());
  },

  clearAdminCode() {
    const config = window.DPRO_SCHOOL_CONFIG;
    localStorage.removeItem(config.adminCodeStorageKey);
  },

  commonHeaders(includeAdmin = false) {
    const config = window.DPRO_SCHOOL_CONFIG;
    const headers = {
      "Content-Type": "application/json",
      "X-Shop-Code": config.shopCode
    };

    if (includeAdmin) {
      const code = this.getAdminCode();
      if (code) headers["X-Admin-Code"] = code;
    }

    return headers;
  },

  async apiGet(path, params = {}, includeAdmin = false) {
    const url = this.apiUrl(path, {
      shop_code: window.DPRO_SCHOOL_CONFIG.shopCode,
      ...params
    });

    const res = await fetch(url, {
      method: "GET",
      headers: this.commonHeaders(includeAdmin)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.ok === false) {
      throw new Error(data.message || data.error || "APIエラーが発生しました。");
    }

    return data;
  },

  async apiPost(path, body = {}, includeAdmin = false) {
    const res = await fetch(this.apiUrl(path), {
      method: "POST",
      headers: this.commonHeaders(includeAdmin),
      body: JSON.stringify({
        shop_code: window.DPRO_SCHOOL_CONFIG.shopCode,
        ...body
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.ok === false) {
      throw new Error(data.message || data.error || "APIエラーが発生しました。");
    }

    return data;
  },

  phoneDigits(value) {
    let s = String(value || "").trim();
    if (s.startsWith("+81")) {
      s = "0" + s.slice(3);
    }
    return s.replace(/[^\d]/g, "");
  },

  normalizeLineText(value) {
    return String(value ?? "")
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
  },

  todayText() {
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return jst.toISOString().slice(0, 10);
  },

  addDaysText(dateText, days) {
    const [y, m, d] = String(dateText).split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + Number(days || 0));
    return date.toISOString().slice(0, 10);
  },

  weekdayLabel(dateText) {
    if (!dateText) return "";
    const [y, m, d] = String(dateText).split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return ["日", "月", "火", "水", "木", "金", "土"][date.getUTCDay()] || "";
  },

  dateWithWeekday(dateText) {
    const w = this.weekdayLabel(dateText);
    return w ? `${dateText}（${w}）` : dateText;
  },

  hhmm(value) {
    return String(value || "").slice(0, 5);
  },

  escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  pageUrl(path, params = {}) {
    const config = window.DPRO_SCHOOL_CONFIG;
    const base = String(config.pagesBaseUrl || location.origin + location.pathname.replace(/[^/]*$/, "")).replace(/\/+$/, "/");
    const url = new URL(path, base);

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }
};
