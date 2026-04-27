// ════════════════════════════════════════════════
//  GAS COOL — نموذج طلب التوظيف
//  Google Apps Script — انسخ هذا الكود كاملاً
//  (نسخة محدثة تحل مشكلة CORS تماماً)
// ════════════════════════════════════════════════
//
//  الخطوات:
//  ① افتح sheets.new → Google Sheet جديد
//  ② Extensions → Apps Script
//  ③ احذف الكود الموجود والصق هذا الكود
//  ④ Ctrl+S للحفظ
//  ⑤ Deploy → New deployment
//       Type: Web App
//       Execute as: Me
//       Who has access: Anyone
//     اضغط Deploy → انسخ الـ URL
//  ⑥ في التطبيق: اضغط ⚙️ → الصق الـ URL → حفظ
//
//  ⚠️ لو عندك deployment قديم: اعمل New deployment جديد
// ════════════════════════════════════════════════

const SHEET_NAME = "Applications";

const COLUMNS = [
  { key: "timestamp",      header: "التاريخ والوقت"      },
  { key: "name",           header: "الاسم الكامل"         },
  { key: "nationality",    header: "الجنسية"              },
  { key: "religion",       header: "الديانة"              },
  { key: "dob",            header: "تاريخ الميلاد"        },
  { key: "birthplace",     header: "جهة الميلاد"          },
  { key: "address",        header: "محل الإقامة"          },
  { key: "marital",        header: "الحالة الاجتماعية"    },
  { key: "phone",          header: "التليفون"             },
  { key: "national_id",    header: "الرقم القومي"         },
  { key: "job_applied",    header: "الوظيفة المطلوبة"     },
  { key: "military",       header: "المعاملة العسكرية"    },
  { key: "education",      header: "المؤهل الدراسي"       },
  { key: "specialization", header: "التخصص"              },
  { key: "graduation",     header: "تاريخ التخرج"         },
  { key: "university",     header: "الجامعة / المعهد"     },
  { key: "iq_score",       header: "درجة الـ IQ"          },
  { key: "iq_pct",         header: "نسبة الـ IQ"          },
  { key: "iq_grade",       header: "تقدير الـ IQ"         },
];

function getOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = COLUMNS.map(c => c.header);
    const hRange  = sheet.getRange(1, 1, 1, headers.length);
    hRange.setValues([headers]);
    hRange.setBackground("#1A3F8F");
    hRange.setFontColor("#FFFFFF");
    hRange.setFontWeight("bold");
    hRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 155);
    sheet.setColumnWidth(2, 160);
  }
  return sheet;
}

// التطبيق يبعت GET request — مفيش CORS مشاكل
function doGet(e) {
  try {
    const p = e.parameter;
    // Health check لو مفيش data
    if (!p || !p.name) {
      return respond({ status: "ok", message: "GAS COOL Script is running ✓" });
    }
    const sheet = getOrCreateSheet();
    const row   = COLUMNS.map(c => p[c.key] || "");
    sheet.appendRow(row);
    sheet.autoResizeColumns(1, COLUMNS.length);
    return respond({ status: "ok" });
  } catch (err) {
    return respond({ status: "error", message: String(err) });
  }
}

function doPost(e) {
  try {
    let data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter || {};
    }
    const sheet = getOrCreateSheet();
    const row   = COLUMNS.map(c => data[c.key] || "");
    sheet.appendRow(row);
    sheet.autoResizeColumns(1, COLUMNS.length);
    return respond({ status: "ok" });
  } catch (err) {
    return respond({ status: "error", message: String(err) });
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
