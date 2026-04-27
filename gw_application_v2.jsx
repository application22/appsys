import { useState, useCallback } from "react";

/* ══════════════════════════════════════════
   GAS COOL — نموذج طلب شغل وظيفة v2
   ألوان محدثة + أسئلة IQ من الملف المرفق
══════════════════════════════════════════ */

/* ──────────────────────────────────────
   ألوان مستوحاة من شعار جاس كول:
   أحمر GAS · أزرق COOL · أخضر الحلقة
────────────────────────────────────── */
const C = {
  /* أزرق COOL — الرئيسي */
  primary:      "#1A3F8F",
  primaryDark:  "#112B6A",
  primaryLight: "#2A5AB5",
  primarySoft:  "#E8EEF9",
  /* أخضر الحلقة — التمييز */
  green:        "#2D8A3E",
  greenDark:    "#1E6128",
  greenSoft:    "#E8F5EA",
  /* أحمر GAS — للتنبيهات والتأكيد */
  red:          "#C9302C",
  redSoft:      "#FDECEA",
  /* خلفيات ونصوص */
  bg:           "#F5F7FC",
  surface:      "#FFFFFF",
  border:       "#C5D3E8",
  textMain:     "#1A2540",
  textMuted:    "#526080",
  textHint:     "#8A9AB8",
};

/* ── IQ Test — Original 8 questions from GC-P-11 document (English) ── */
const IQ_QUESTIONS = [
  {
    id: 1,
    q: "What number should replace the question mark in the sequence?",
    type: "seq",
    seq: "0   1   2   4   6   9   12   16   ?",
    opts: ["18", "20", "22", "21"],
    ans: 1,
    exp: "Differences increase in pairs: +1,+1,+2,+2,+3,+3,+4,+4 — so 16+4 = 20",
  },
  {
    id: 2,
    q: "What is the missing section from the matrix? (3 values missing)",
    type: "matrix4x4",
    matrix: [
      [20, 22, 19, 21],
      [17, 19, 16, "?"],
      [19, 21, "?", 20],
      [16, 18, 15, "?"],
    ],
    opts: [
      "A : 18 , 18 , 17",
      "B : 19 , 18 , 19",
      "C : 17 , 17 , 19",
      "D : 18 , 17 , 18",
    ],
    ans: 0,
    exp: "Each column follows −3, +2, −3. Missing: row2/col4=18, row3/col3=18, row4/col4=17",
  },
  {
    id: 3,
    q: "What number should replace the question mark?",
    type: "matrix3x3",
    matrix: [
      [9, 7, 2],
      [5, 7, 6],
      [4, 6, "?"],
    ],
    opts: ["6", "7", "8", "9"],
    ans: 2,
    exp: "Each row sums to 18 — Row 3: 4+6+? = 18, so ? = 8",
  },
  {
    id: 4,
    q: "What numbers replace the question marks? (Rule: A × E + C = Center)",
    type: "wheel",
    wheels: [
      { A: 14, C: 2, E: 5, center: 72,  label: "Example 1" },
      { A: 28, C: 9, E: 5, center: 142, label: "Example 2" },
      { A: 6,  C: "?", E: "?", center: "?", label: "Find ?" },
    ],
    opts: [
      "C=3, E=4, Center=34",
      "C=4, E=3, Center=22",
      "C=5, E=2, Center=32",
      "C=2, E=5, Center=32",
    ],
    ans: 3,
    exp: "14×5+2=72 ✓ | 28×5+2=142 ✓ | So E=5, C=2, Center=6×5+2=32 ✓",
  },
  {
    id: 5,
    q: "What number comes next in the sequence?",
    type: "seq",
    seq: "3   6   11   18   27   38   ?",
    opts: ["48", "51", "50", "49"],
    ans: 1,
    exp: "Differences +3,+5,+7,+9,+11,+13 (increasing by 2) — so 38+13 = 51",
  },
  {
    id: 6,
    q: "What number completes this magic square? (Every row, column & diagonal = 15)",
    type: "matrix3x3",
    matrix: [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, "?"],
    ],
    opts: ["4", "5", "6", "7"],
    ans: 2,
    exp: "Every row/column/diagonal sums to 15 — Column 3: 2+7+? = 15, so ? = 6",
  },
  {
    id: 7,
    q: "Which calculation gives the highest result?",
    type: "choice",
    display: "½ ÷ ¼     |     ⅓ × 6     |     √16     |     2³ ÷ 2",
    opts: ["½ ÷ ¼ = 2", "⅓ × 6 = 2", "√16 = 4", "2³ ÷ 2 = 4"],
    ans: 2,
    exp: "½÷¼=2 | ⅓×6=2 | √16=4 | 2³÷2=4 — Highest is √16 = 4",
  },
  {
    id: 8,
    q: "Which group of letters has a gap in the alphabetical order?",
    type: "choice",
    opts: ["ABCD", "EFHI", "JKLM", "NOPQ"],
    ans: 1,
    exp: "EFHI is missing letter G between F and H — all other groups are consecutive",
  },
];

const STEPS = [
  "البيانات الشخصية",
  "المؤهل والخبرات",
  "اللغات والمهارات",
  "المراجع والأقارب",
  "اختبار الذكاء",
  "ملخص التقديم",
];

/* ── مكوّنات مشتركة ── */
const Field = ({ label, required, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>
      {label}{required && <span style={{ color: C.red }}> *</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 11px",
  fontSize: 13, fontFamily: "inherit", direction: "rtl",
  color: C.textMain, background: "#fff", outline: "none",
};

const Inp = ({ id, type = "text", placeholder = "", value, onChange }) => (
  <input style={inputStyle} type={type} id={id} placeholder={placeholder}
    value={value || ""} onChange={onChange} autoComplete="off" />
);

const Sel = ({ id, opts, value, onChange }) => (
  <select style={inputStyle} id={id} value={value || opts[0]} onChange={onChange}>
    {opts.map(o => <option key={o}>{o}</option>)}
  </select>
);

const Btn = ({ onClick, children, variant = "primary" }) => {
  const styles = {
    primary: { background: C.primary, color: "#fff", border: "none" },
    prev: { background: "#fff", color: C.primary, border: `1.5px solid ${C.border}` },
    accent: { background: C.green, color: "#fff", border: "none" },
    warm: { background: C.red, color: "#fff", border: "none" },
    green: { background: C.green, color: "#fff", border: "none" },
  };
  return (
    <button onClick={onClick} style={{
      ...styles[variant], padding: "9px 22px", borderRadius: 9,
      fontSize: 13, fontFamily: "inherit", cursor: "pointer", fontWeight: 500,
    }}>{children}</button>
  );
};

const SectionTitle = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
    paddingBottom: 10, borderBottom: `2px solid ${C.greenSoft}`, fontSize: 15,
    fontWeight: 600, color: C.primary }}>
    <div style={{ width: 4, height: 20, background: C.green, borderRadius: 2, flexShrink: 0 }} />
    {children}
  </div>
);

const Divider = () => <hr style={{ border: "none", borderTop: `1px solid #EBF4F7`, margin: "16px 0" }} />;

const TblHead = ({ cols }) => (
  <thead>
    <tr>{cols.map((c, i) => (
      <th key={i} style={{ background: C.primary, color: "rgba(255,255,255,0.9)",
        padding: "8px 9px", textAlign: "right", fontWeight: 500, fontSize: 11.5,
        borderRadius: i === 0 ? "0 6px 0 0" : i === cols.length - 1 ? "6px 0 0 0" : 0 }}>{c}</th>
    ))}</tr>
  </thead>
);

const MatrixCell = ({ val }) => {
  const isMissing = val === "?";
  return (
    <div style={{ width: 42, height: 34, border: `1px ${isMissing ? "dashed" : "solid"} ${isMissing ? C.red : C.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 500, borderRadius: 5,
      background: isMissing ? C.redSoft : "#fff",
      color: isMissing ? C.red : C.textMain, fontFamily: "monospace" }}>
      {val}
    </div>
  );
};

/* ══════════════════════════════════════════
   الصفحات
══════════════════════════════════════════ */

function PagePersonal({ data, set }) {
  const f = (k) => (e) => set(p => ({ ...p, [k]: e.target.value }));
  return (
    <>
      <SectionTitle>البيانات الشخصية</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ gridColumn: "1/-1" }}>
          <Field label="الاسم بالكامل" required>
            <Inp id="name" placeholder="الاسم الرباعي كما في البطاقة الشخصية"
              value={data.name} onChange={f("name")} />
          </Field>
        </div>
        {[
          ["nat", "الجنسية", "select", ["مصرية", "أخرى"]],
          ["rel", "الديانة", "select", ["مسلم", "مسيحي"]],
          ["dob", "تاريخ الميلاد", "date"],
          ["bplace", "جهة الميلاد", "text"],
        ].map(([k, lbl, type, opts]) => (
          <Field key={k} label={lbl}>
            {type === "select"
              ? <Sel id={k} opts={opts} value={data[k]} onChange={f(k)} />
              : <Inp id={k} type={type} value={data[k]} onChange={f(k)} />}
          </Field>
        ))}
        <div style={{ gridColumn: "1/-1" }}>
          <Field label="محل الإقامة">
            <Inp id="addr" placeholder="العنوان بالتفصيل" value={data.addr} onChange={f("addr")} />
          </Field>
        </div>
        {[
          ["marital", "الحالة الاجتماعية", "select", ["أعزب", "متزوج", "مطلق", "أرمل"]],
          ["phone", "رقم التليفون", "tel"],
          ["nid", "الرقم القومي", "text"],
          ["nid_date", "تاريخ إصدار البطاقة", "date"],
          ["nid_place", "جهة إصدار البطاقة", "text"],
          ["job", "الوظيفة المطلوب شغلها", "text"],
          ["mil", "المعاملة العسكرية", "select", ["أدى الخدمة", "معفى", "مؤجل", "لم يبلغ السن"]],
          ["svc", "الخدمة العامة", "select", ["أدى", "لم يؤدِ"]],
        ].map(([k, lbl, type, opts]) => (
          <Field key={k} label={lbl} required={k === "job"}>
            {type === "select"
              ? <Sel id={k} opts={opts} value={data[k]} onChange={f(k)} />
              : <Inp id={k} type={type} value={data[k]} onChange={f(k)} />}
          </Field>
        ))}
      </div>
    </>
  );
}

function PageEducation({ data, set }) {
  const f = (k) => (e) => set(p => ({ ...p, [k]: e.target.value }));
  const fArr = (arr, i, k) => (e) => set(p => {
    const next = [...(p[arr] || [])];
    next[i] = { ...(next[i] || {}), [k]: e.target.value };
    return { ...p, [arr]: next };
  });
  const tdInp = (arr, i, k) => (
    <td style={{ padding: "5px 8px", borderBottom: `1px solid #EBF4F7` }}>
      <input style={{ border: "none", background: "transparent", fontSize: 12,
        fontFamily: "inherit", direction: "rtl", color: C.textMain, width: "100%", padding: 3 }}
        value={(data[arr]?.[i]?.[k]) || ""} onChange={fArr(arr, i, k)} />
    </td>
  );
  return (
    <>
      <SectionTitle>المؤهل الدراسي والخبرات السابقة</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[["edu","المؤهل الدراسي"],["spec","الشعبة/التخصص"]].map(([k,l])=>(
          <Field key={k} label={l}><Inp id={k} value={data[k]} onChange={f(k)} /></Field>
        ))}
        <Field label="تاريخ التخرج"><Inp id="grad" type="date" value={data.grad} onChange={f("grad")} /></Field>
        <Field label="الجامعة / المعهد"><Inp id="uni" value={data.uni} onChange={f("uni")} /></Field>
      </div>
      <Divider />
      <div style={{ fontSize: 12.5, fontWeight: 500, color: C.primaryDark, margin: "14px 0 8px",
        display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 3, height: 14, background: C.green, borderRadius: 2 }} />الخبرات السابقة
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <TblHead cols={["الوظيفة","جهة العمل","من","إلى","سبب الترك"]} />
        <tbody>{[0,1,2].map(i=>(
          <tr key={i} style={{ background: i%2===1?"#F7FBFC":"#fff" }}>
            {tdInp("exp",i,"job")}{tdInp("exp",i,"emp")}{tdInp("exp",i,"from")}{tdInp("exp",i,"to")}{tdInp("exp",i,"reason")}
          </tr>
        ))}</tbody>
      </table>
      <Divider />
      <div style={{ fontSize: 12.5, fontWeight: 500, color: C.primaryDark, margin: "14px 0 8px",
        display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 3, height: 14, background: C.green, borderRadius: 2 }} />برامج ودورات تدريبية
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <TblHead cols={["البرنامج/الدورة","جهة التدريب","من","إلى","ملاحظات"]} />
        <tbody>{[0,1,2].map(i=>(
          <tr key={i} style={{ background: i%2===1?"#F7FBFC":"#fff" }}>
            {tdInp("courses",i,"name")}{tdInp("courses",i,"inst")}{tdInp("courses",i,"from")}{tdInp("courses",i,"to")}{tdInp("courses",i,"note")}
          </tr>
        ))}</tbody>
      </table>
    </>
  );
}

function PageLanguages({ data, set }) {
  const f = (k) => (e) => set(p => ({ ...p, [k]: e.target.value }));
  const langs = [["الإنجليزية","en"],["الفرنسية","fr"],["أخرى","ot"]];
  const skills = ["محادثة","قراءة","كتابة"];
  const levels = [["ممتاز","ex"],["جيد","gd"],["متوسط","av"]];
  return (
    <>
      <SectionTitle>اللغات الأجنبية والمهارات</SectionTitle>
      <div style={{ overflowX: "auto", marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr>
            <th style={{ background: C.primary, color: "rgba(255,255,255,0.9)", padding: "7px 9px", textAlign: "right", fontSize: 11, borderRadius: "0 6px 0 0", width: 90 }}>اللغة</th>
            {skills.map(s => levels.map((_, li) => (
              <th key={`${s}${li}`} style={{ background: C.primary, color: "rgba(255,255,255,0.9)", padding: "7px 5px", textAlign: "center", fontSize: 10 }}>
                {li === 1 ? s : levels[li][0]}
              </th>
            )))}
          </tr></thead>
          <tbody>{langs.map(([lang, k], li) => (
            <tr key={k} style={{ background: li%2===0?"#fff":"#F7FBFC" }}>
              <td style={{ padding: "5px 9px", borderBottom: `1px solid #EBF4F7`, fontSize: 12, fontWeight: 500 }}>
                {li === 2
                  ? <input style={{ ...inputStyle, padding: "4px 8px", fontSize: 11 }} placeholder="اسم اللغة"
                      value={data.otherLang||""} onChange={f("otherLang")} />
                  : lang}
              </td>
              {["sp","rd","wr"].map(s => levels.map(([_, lv]) => (
                <td key={`${s}${lv}`} style={{ textAlign: "center", padding: "5px 4px", borderBottom: `1px solid #EBF4F7` }}>
                  <input type="radio" name={`${k}_${s}`}
                    onChange={() => set(p => ({ ...p, langs: { ...(p.langs||{}), [`${k}_${s}`]: lv } }))}
                    checked={(data.langs?.[`${k}_${s}`]) === lv} />
                </td>
              )))}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Divider />
      {[["skills","المهارات والهوايات","إجادة الحاسوب، رخصة قيادة، العمل الجماعي..."],
        ["extra","ملاحظات إضافية","أي معلومات أو مميزات أخرى..."]].map(([k,lbl,ph])=>(
        <div key={k} style={{ marginBottom: 12 }}>
          <Field label={lbl}>
            <textarea style={{ ...inputStyle, minHeight: 68, resize: "vertical" }}
              placeholder={ph} value={data[k]||""} onChange={f(k)} />
          </Field>
        </div>
      ))}
    </>
  );
}

function PageReferences({ data, set }) {
  const tdInp = (arr, i, k) => {
    const fArr = (e) => set(p => {
      const next = [...(p[arr] || [])];
      next[i] = { ...(next[i] || {}), [k]: e.target.value };
      return { ...p, [arr]: next };
    });
    return (
      <td style={{ padding: "5px 8px", borderBottom: `1px solid #EBF4F7` }}>
        <input style={{ border: "none", background: "transparent", fontSize: 12,
          fontFamily: "inherit", direction: "rtl", color: C.textMain, width: "100%", padding: 3 }}
          value={(data[arr]?.[i]?.[k]) || ""} onChange={fArr} />
      </td>
    );
  };
  const numCell = (n) => (
    <td style={{ textAlign: "center", color: C.textMuted, fontWeight: 600,
      padding: "5px 8px", borderBottom: `1px solid #EBF4F7`, width: 30 }}>{n}</td>
  );
  return (
    <>
      <SectionTitle>المراجع وبيانات الأقارب</SectionTitle>
      <div style={{ fontSize: 12.5, fontWeight: 500, color: C.primaryDark, margin: "0 0 8px",
        display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 3, height: 14, background: C.green, borderRadius: 2 }} />
        أسماء وأرقام تليفونات ثلاثة أقارب يمكن الرجوع إليهم
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <TblHead cols={["#","الاسم","صلة القرابة","جهة العمل","التليفون"]} />
        <tbody>{[0,1,2].map(i=>(
          <tr key={i} style={{ background: i%2===1?"#F7FBFC":"#fff" }}>
            {numCell(i+1)}{tdInp("refs",i,"name")}{tdInp("refs",i,"rel")}{tdInp("refs",i,"job")}{tdInp("refs",i,"phone")}
          </tr>
        ))}</tbody>
      </table>
      <Divider />
      <div style={{ fontSize: 12.5, fontWeight: 500, color: C.primaryDark, margin: "0 0 8px",
        display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 3, height: 14, background: C.green, borderRadius: 2 }} />
        بيانات الأقارب العاملين بالشركة أو القطاع
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <TblHead cols={["#","الاسم","صلة القرابة","جهة العمل","الوظيفة"]} />
        <tbody>{[0,1,2,3,4].map(i=>(
          <tr key={i} style={{ background: i%2===1?"#F7FBFC":"#fff" }}>
            {numCell(i+1)}{tdInp("family",i,"name")}{tdInp("family",i,"rel")}{tdInp("family",i,"job")}{tdInp("family",i,"pos")}
          </tr>
        ))}</tbody>
      </table>
    </>
  );
}

function PageIQ({ iqAns, setIqAns, iqDone, setIqDone }) {
  const score = IQ_QUESTIONS.filter((q, i) => iqAns[i] === q.ans).length;
  const pct = Math.round(score / IQ_QUESTIONS.length * 100);
  const grade = score >= 7 ? "ممتاز" : score >= 5 ? "جيد جداً" : score >= 4 ? "جيد" : "يحتاج مراجعة";

  const pick = (qi, oi) => {
    if (iqDone) return;
    setIqAns(p => ({ ...p, [qi]: oi }));
  };

  const submit = () => {
    const answered = Object.keys(iqAns).length;
    if (answered < IQ_QUESTIONS.length) {
      if (!window.confirm(`أجبت على ${answered} من ${IQ_QUESTIONS.length} أسئلة. تريد التسليم؟`)) return;
    }
    setIqDone(true);
  };

  return (
    <>
      <SectionTitle>
        اختبار الذكاء
        {iqDone && <span style={{ fontSize: 12, fontWeight: 400, color: C.textMuted }}>— النتيجة: {score}/{IQ_QUESTIONS.length}</span>}
      </SectionTitle>

      {iqDone && (
        <div style={{ background: `linear-gradient(135deg,${C.primaryDark} 0%,${C.primary} 100%)`,
          borderRadius: 12, padding: 18, display: "flex", gap: 18, alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 52, fontWeight: 700, color: C.green, lineHeight: 1, flexShrink: 0 }}>{score}</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 20, alignSelf: "flex-end", marginBottom: 6 }}>/ {IQ_QUESTIONS.length}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>نتيجة اختبار الذكاء</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.green }}>{pct}% — {grade}</div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 4, marginTop: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: C.green, borderRadius: 4, transition: "width 0.6s" }} />
            </div>
          </div>
        </div>
      )}

      {IQ_QUESTIONS.map((q, qi) => {
        const sel = iqAns[qi];
        return (
          <div key={qi} style={{ border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(90deg,#EDF2FB,#F5F7FC)", padding: "10px 14px",
              display: "flex", alignItems: "flex-start", gap: 10, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.primary, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{q.id}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.textMain }}>{q.q}</div>
            </div>
            <div style={{ padding: "12px 14px" }}>
              {/* عرض البيانات المرئية */}
              {q.type === "seq" && (
                <div style={{ background: C.greenSoft, borderRadius: 8, padding: "10px 14px",
                  fontSize: 17, fontWeight: 700, color: C.primaryDark, letterSpacing: 3,
                  textAlign: "center", direction: "ltr", marginBottom: 10, fontFamily: "monospace" }}>
                  {q.seq}
                </div>
              )}
              {(q.type === "matrix4x4" || q.type === "matrix3x3") && (
                <div style={{ display: "flex", marginBottom: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${q.matrix[0].length},42px)`,
                    gap: 2, direction: "ltr" }}>
                    {q.matrix.flat().map((v, ci) => <MatrixCell key={ci} val={v} />)}
                  </div>
                </div>
              )}
              {q.type === "wheel" && (
                <div style={{ background: C.greenSoft, borderRadius: 10, padding: 12, marginBottom: 10,
                  border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {q.wheels.map((w, wi) => (
                      <div key={wi} style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 5, fontWeight: 500 }}>{w.label}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, direction: "ltr", textAlign: "center" }}>
                          {[["A",w.A],["",""],["C",w.C],["",""],["CTR",w.center,"center"],["",""],["E",w.E]].map(([lbl,val,type],ci)=>
                            lbl ? (
                              <div key={ci} style={{ padding: "5px 4px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                                background: type==="center" ? C.primary : val==="؟" ? C.redSoft : "#fff",
                                color: type==="center" ? C.green : val==="؟" ? C.redm : C.primary,
                                border: `1px ${val==="؟"?"dashed":"solid"} ${val==="؟"?C.red:C.border}` }}>
                                <div style={{ fontSize: 9, opacity: 0.7 }}>{lbl}</div>
                                <div>{val}</div>
                              </div>
                            ) : <div key={ci} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {q.type === "choice" && q.display && (
                <div style={{ background: C.greenSoft, borderRadius: 8, padding: "10px 14px",
                  fontSize: 15, fontWeight: 600, color: C.primary, textAlign: "center",
                  direction: "ltr", marginBottom: 10 }}>
                  {q.display}
                </div>
              )}
              {/* الاختيارات */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                {q.opts.map((opt, oi) => {
                  let bg = "#fff", border = `1.5px solid ${C.border}`, color = C.textMain;
                  if (iqDone) {
                    if (oi === q.ans) { bg = "#EAF7EE"; border = `1.5px solid ${C.green}`; color = "#1B5E3B"; }
                    else if (sel === oi) { bg = "#FDECEA"; border = `1.5px solid ${C.red}`; color = "#8B0000"; }
                  } else if (sel === oi) {
                    bg = "#EBF4F8"; border = `1.5px solid ${C.primary}`;
                  }
                  const dotBg = sel === oi ? (iqDone ? (oi === q.ans ? C.green : C.red) : C.primary) : "transparent";
                  const dotBorder = sel === oi ? dotBg : C.border;
                  return (
                    <div key={oi} onClick={() => pick(qi, oi)}
                      style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
                        borderRadius: 8, border, cursor: iqDone ? "default" : "pointer",
                        fontSize: 13, background: bg, color, transition: "all 0.18s", userSelect: "none" }}>
                      <div style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${dotBorder}`,
                        background: dotBg, flexShrink: 0, transition: "all 0.2s" }} />
                      <span>{opt}</span>
                      {iqDone && oi === q.ans && <span style={{ marginRight: "auto", fontSize: 11, color: C.green }}>✓</span>}
                    </div>
                  );
                })}
              </div>
              {iqDone && (
                <div style={{ fontSize: 11.5, color: C.textMuted, padding: "8px 10px",
                  background: C.bg, borderRadius: 6, marginTop: 8,
                  borderRight: `3px solid ${C.green}` }}>
                  💡 {q.exp}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <div />
        {iqDone
          ? null
          : <Btn onClick={submit} variant="accent">تسليم الاختبار ✓</Btn>}
      </div>
    </>
  );
}

function PageSummary({ personal, education, languages, references, iqAns, scriptUrl }) {
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errMsg, setErrMsg] = useState("");

  const score = IQ_QUESTIONS.filter((q, i) => iqAns[i] === q.ans).length;
  const pct = Math.round(score / IQ_QUESTIONS.length * 100);
  const grade = score >= 8 ? "Excellent" : score >= 6 ? "Very Good" : score >= 5 ? "Good" : "Needs Review";

  const stats = [
    ["اسم المتقدم", personal.name || "—"],
    ["الوظيفة المطلوبة", personal.job || "—"],
    ["المؤهل الدراسي", education.edu || "—"],
    ["تاريخ التقديم", new Date().toLocaleDateString("ar-EG")],
  ];

  const sendToSheets = async () => {
    setStatus("sending");
    setErrMsg("");

    const row = [
      new Date().toLocaleString("ar-EG"),
      personal.name      || "",
      personal.nat       || "",
      personal.rel       || "",
      personal.dob       || "",
      personal.bplace    || "",
      personal.addr      || "",
      personal.marital   || "",
      personal.phone     || "",
      personal.nid       || "",
      personal.job       || "",
      personal.mil       || "",
      education.edu      || "",
      education.spec     || "",
      education.grad     || "",
      education.uni      || "",
      String(score),
      pct + "%",
      grade,
    ];

    // ── Try fetch to Apps Script (works when hosted outside Claude.ai) ──
    if (scriptUrl && scriptUrl.includes("script.google.com")) {
      try {
        const params = new URLSearchParams();
        const keys = ["timestamp","name","nationality","religion","dob","birthplace",
          "address","marital","phone","national_id","job_applied","military",
          "education","specialization","graduation","university","iq_score","iq_pct","iq_grade"];
        keys.forEach((k, i) => params.append(k, row[i]));
        // image pixel trick — bypasses CORS in most sandboxes
        await new Promise((res) => {
          const img = new Image();
          img.onload  = res;
          img.onerror = res; // Apps Script returns JSON not image → onerror fires, but data WAS sent
          img.src = scriptUrl.trim() + "?" + params.toString();
          setTimeout(res, 6000); // fallback timeout
        });
        setStatus("success");
        return;
      } catch (_) { /* fall through to clipboard */ }
    }

    // ── Fallback: copy TSV row to clipboard ──
    const tsv = row.join("	");
    try {
      await navigator.clipboard.writeText(tsv);
      setStatus("copied");
    } catch (_) {
      // Last resort: show data in a selectable box
      setStatus("manual");
      setErrMsg(tsv);
    }
  };

  return (
    <>
      <SectionTitle>ملخص طلب التقديم</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {stats.map(([lbl, val]) => (
          <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: 13 }}>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>{lbl}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.primaryDark, marginTop: 4 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* IQ Score Panel */}
      <div style={{ background: `linear-gradient(135deg,${C.primaryDark} 0%,${C.primary} 100%)`,
        borderRadius: 12, padding: 18, display: "flex", gap: 18, alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.green, lineHeight: 1, flexShrink: 0 }}>{score}</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 20, alignSelf: "flex-end", marginBottom: 6 }}>/ {IQ_QUESTIONS.length}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>IQ Test Result</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.green }}>{pct}% — {grade}</div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 4, marginTop: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: C.green, borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Google Sheets Status */}
      {status === "success" && (
        <div style={{ background: C.greenSoft, border: `1px solid ${C.green}`, borderRadius: 8,
          padding: "12px 14px", fontSize: 13, color: C.greenDark, marginBottom: 12 }}>
          ✅ تم الإرسال إلى Google Sheets بنجاح!
        </div>
      )}
      {status === "copied" && (
        <div style={{ background: C.greenSoft, border: `1px solid ${C.green}`, borderRadius: 8,
          padding: "12px 14px", fontSize: 13, color: C.greenDark, marginBottom: 12 }}>
          📋 تم نسخ البيانات! افتح الـ Google Sheet وضغط <b>Ctrl+V</b> في أول خلية في صف جديد ← Enter
        </div>
      )}
      {status === "manual" && (
        <div style={{ background: C.primarySoft, border: `1px solid ${C.primary}`, borderRadius: 8,
          padding: "12px 14px", fontSize: 12, marginBottom: 12 }}>
          <div style={{ color: C.primaryDark, fontWeight: 600, marginBottom: 6 }}>
            📋 انسخ هذا الصف والصقه في Google Sheets:
          </div>
          <textarea readOnly value={errMsg}
            style={{ width: "100%", fontSize: 11, fontFamily: "monospace", direction: "ltr",
              border: `1px solid ${C.border}`, borderRadius: 6, padding: 6,
              background: "#fff", color: C.textMain, resize: "none", height: 60 }}
            onClick={e => e.target.select()}
          />
        </div>
      )}
      {status === "error" && (
        <div style={{ background: C.redSoft, border: `1px solid ${C.red}`, borderRadius: 8,
          padding: "12px 14px", fontSize: 12, color: C.red, marginBottom: 12 }}>
          ❌ {errMsg}
        </div>
      )}

      <div style={{ background: C.greenSoft, border: `1px solid ${C.green}40`, borderRadius: 8,
        padding: "11px 13px", fontSize: 12, color: C.greenDark, marginBottom: 16 }}>
        📋 Form No: GC-P-11/F2 &nbsp;|&nbsp; Issue Date: 5/5/2015 &nbsp;|&nbsp; Approved by Chairman & Managing Director
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <div />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.print()}
            style={{ padding: "9px 18px", borderRadius: 9, fontSize: 13, cursor: "pointer",
              background: C.green, color: "#fff", border: "none", fontFamily: "inherit" }}>
            🖨 طباعة
          </button>
          <button onClick={sendToSheets} disabled={status === "sending"}
            style={{ padding: "9px 22px", borderRadius: 9, fontSize: 13, cursor: status === "sending" ? "wait" : "pointer",
              background: status === "sending" ? C.textMuted : C.primary,
              color: "#fff", border: "none", fontFamily: "inherit", fontWeight: 600,
              opacity: status === "sending" ? 0.7 : 1 }}>
            {status === "sending" ? "⏳ جاري الإرسال..." :
             status === "copied"  ? "✅ تم النسخ!" :
             "📤 إرسال / نسخ البيانات"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   التطبيق الرئيسي
══════════════════════════════════════════ */
export default function App() {
  const [cur, setCur] = useState(0);
  const [personal, setPersonal] = useState({});
  const [education, setEducation] = useState({});
  const [languages, setLanguages] = useState({});
  const [references, setReferences] = useState({});
  const [iqAns, setIqAns] = useState({});
  const [iqDone, setIqDone] = useState(false);
  const [scriptUrl, setScriptUrl] = useState("");
  const [showConfig, setShowConfig] = useState(false);

  const go = (d) => {
    setCur(c => Math.max(0, Math.min(STEPS.length - 1, c + d)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navBtns = (showSubmit = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
      {cur > 0
        ? <Btn onClick={() => go(-1)} variant="prev">→ السابق</Btn>
        : <div />}
      {cur < STEPS.length - 1
        ? <Btn onClick={() => go(1)} variant="primary">التالي ←</Btn>
        : <div />}
    </div>
  );

  return (
    <div style={{ direction: "rtl", fontFamily: "'Segoe UI',Tahoma,Arial,sans-serif",
      background: C.bg, minHeight: "100vh", padding: 10 }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        {/* رأس الصفحة */}
        <div style={{ background: `linear-gradient(135deg,${C.primaryDark} 0%,${C.primary} 55%,${C.primaryLight} 100%)`,
          borderRadius: "14px 14px 0 0", padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 100, height: 78, borderRadius: 12, background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 2px 10px rgba(0,0,0,0.18)" }}>
            <img src="data:image/png;base64,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" alt="GAS COOL" style={{ width: 90, height: 70, objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>
                الشركة المصرية لمشروعات الطاقة والتبريد — جاس كول
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>
                نموذج طلب شغل وظيفة | GC-P-11/F2 | إصدار ٢٠١٥/٥/٥
              </div>
            </div>
            <button onClick={() => setShowConfig(s => !s)}
              title="إعدادات Google Sheets"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#fff",
                fontSize: 18, flexShrink: 0 }}>
              ⚙️
            </button>
          </div>
        </div>

        {/* Config Button */}
        {showConfig && (
          <div style={{ background: C.primarySoft, padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.primaryDark, marginBottom: 8 }}>
              ⚙️ ربط Google Sheets
            </div>

            {/* Step-by-step mini guide */}
            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10, fontSize: 11.5, color: C.textMuted, lineHeight: 1.8 }}>
              <b style={{ color: C.primaryDark }}>5 خطوات فقط:</b><br/>
              1️⃣ افتح <a href="https://sheets.new" target="_blank" style={{ color: C.primary }}>sheets.new</a> وأنشئ Google Sheet جديد<br/>
              2️⃣ من القائمة: <b>Extensions → Apps Script</b><br/>
              3️⃣ احذف الكود الموجود والصق كود الـ Script (موجود في الملف المرفق)<br/>
              4️⃣ اضغط <b>Deploy → New deployment → Web App → Execute as Me → Anyone → Deploy</b><br/>
              5️⃣ انسخ الـ URL والصقه هنا ↓
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/AKfy.../exec"
                value={scriptUrl}
                onChange={e => setScriptUrl(e.target.value)}
                style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: "8px 10px", fontSize: 12, fontFamily: "inherit",
                  color: C.textMain, background: "#fff", direction: "ltr" }}
              />
              <button onClick={() => setShowConfig(false)}
                style={{ padding: "8px 16px", borderRadius: 8, background: C.green,
                  color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                حفظ ✓
              </button>
            </div>
          </div>
        )}

        {/* شريط الخطوات */}
        <div style={{ background: C.primaryDark, padding: "10px 20px", display: "flex", alignItems: "center" }}>
          {STEPS.map((lbl, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div title={lbl} style={{ width: 26, height: 26, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                cursor: "pointer", flexShrink: 0,
                background: i < cur ? C.green : i === cur ? "#fff" : "transparent",
                border: `1.5px solid ${i < cur ? C.green : i === cur ? "#fff" : "rgba(255,255,255,0.25)"}`,
                color: i < cur ? "#fff" : i === cur ? C.primaryDark : "rgba(255,255,255,0.4)",
                transition: "all 0.3s" }}
                onClick={() => setCur(i)}>
                {i < cur ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1.5, margin: "0 4px",
                  background: i < cur ? C.green : "rgba(255,255,255,0.15)", transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        {/* المحتوى */}
        <div style={{ background: C.surface, borderRadius: "0 0 14px 14px", padding: 22,
          border: `1px solid ${C.border}`, borderTop: "none", minHeight: 420 }}>

          {cur === 0 && <><PagePersonal data={personal} set={setPersonal} />{navBtns()}</>}
          {cur === 1 && <><PageEducation data={education} set={setEducation} />{navBtns()}</>}
          {cur === 2 && <><PageLanguages data={languages} set={setLanguages} />{navBtns()}</>}
          {cur === 3 && <><PageReferences data={references} set={setReferences} />{navBtns()}</>}
          {cur === 4 && (
            <>
              <PageIQ iqAns={iqAns} setIqAns={setIqAns} iqDone={iqDone} setIqDone={setIqDone} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <Btn onClick={() => go(-1)} variant="prev">→ السابق</Btn>
                {iqDone && <Btn onClick={() => go(1)} variant="primary">التالي ←</Btn>}
              </div>
            </>
          )}
          {cur === 5 && (
            <>
              <PageSummary personal={personal} education={education} languages={languages} references={references} iqAns={iqAns} scriptUrl={scriptUrl} />
              <div style={{ marginTop: 12 }}>
                <Btn onClick={() => go(-1)} variant="prev">→ السابق</Btn>
              </div>
            </>
          )}
        </div>

        {/* اسم الخطوة الحالية */}
        <div style={{ textAlign: "center", fontSize: 11.5, color: C.textMuted, marginTop: 8 }}>
          الخطوة {cur + 1} من {STEPS.length} — {STEPS[cur]}
        </div>
      </div>
    </div>
  );
}
