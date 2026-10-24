// ============================================================
//  app.js  —  ตรรกะหน้าเว็บ (ทำให้เสร็จแล้ว ★ นิสิตไม่ต้องแก้)
//  ปรับช่องค้นหา/ฟอร์มได้ที่ตัวแปร ENTITIES ด้านล่าง
// ============================================================
// ★ ตัวอย่าง dropdown ที่อ่านข้อมูลจากฐานข้อมูล: ฟอร์ม "ออเดอร์" ช่อง cust_id
//   แสดง name แต่ส่งค่าเป็น cust_id (อ่านรายการจาก /api/customers)
//   ช่อง FK อื่น ๆ ทำแบบเดียวกันได้ — เปลี่ยน "type": "number" เป็น select + optionsFrom
const ENTITIES = {
  "customers": {
    "label": "ลูกค้า",
    "api": "/api/customers",
    "idKey": "cust_id",
    "search": [
      {
        "key": "name",
        "label": "ชื่อ",
        "type": "text"
      },
      {
        "key": "phone",
        "label": "เบอร์โทร",
        "type": "text"
      },
      {
        "key": "invited_customer",
        "label": "คนชวน (id)",
        "type": "number"
      },
      {
        "key": "member_tier",
        "label": "ระดับ",
        "type": "select",
        "options": [
          "",
          "normal",
          "silver",
          "gold",
          "vip"
        ]
      }
    ],
    "form": [
      {
        "key": "name",
        "label": "ชื่อ",
        "type": "text"
      },
      {
        "key": "phone",
        "label": "เบอร์โทร",
        "type": "text"
      },
      {
        "key": "invited_customer",
        "label": "คนชวน (id)",
        "type": "number"
      },
      {
        "key": "member_tier",
        "label": "ระดับ",
        "type": "select",
        "options": [
          "normal",
          "silver",
          "gold",
          "vip"
        ]
      }
    ]
  },
  "items": {
    "label": "เมนูอาหาร",
    "api": "/api/menu-items",
    "idKey": "item_id",
    "search": [
      {
        "key": "name",
        "label": "ชื่อเมนู",
        "type": "text"
      },
      {
        "key": "category",
        "label": "หมวดหมู่",
        "type": "text"
      },
      {
        "key": "status",
        "label": "สถานะ",
        "type": "select",
        "options": [
          "",
          { "value": "available", "label": "ขายปกติ" },
          { "value": "out_of_stock", "label": "หมด" },
          { "value": "discontinued", "label": "ยกเลิกถาวร" }
        ]
      }
    ],
    "form": [
      {
        "key": "name",
        "label": "ชื่อเมนู",
        "type": "text"
      },
      {
        "key": "category",
        "label": "หมวดหมู่",
        "type": "text"
      },
      {
        "key": "price",
        "label": "ราคา",
        "type": "number"
      },
      {
        "key": "status",
        "label": "สถานะ",
        "type": "select",
        "options": [
          { "value": "available", "label": "ขายปกติ" },
          { "value": "out_of_stock", "label": "หมด" },
          { "value": "discontinued", "label": "ยกเลิกถาวร" }
        ]
      }
    ]
  },
  "tables": {
    "label": "โต๊ะ",
    "api": "/api/dining-tables",
    "idKey": "table_id",
    "search": [
      {
        "key": "seats",
        "label": "จำนวนที่นั่ง",
        "type": "number"
      },
      {
        "key": "zone",
        "label": "โซน",
        "type": "text"
      }
    ],
    "form": [
      {
        "key": "seats",
        "label": "จำนวนที่นั่ง",
        "type": "number"
      },
      {
        "key": "zone",
        "label": "โซน",
        "type": "text"
      }
    ]
  },
  "orders": {
    "label": "ออเดอร์",
    "api": "/api/orders",
    "idKey": "order_id",
    "search": [
      {
        "key": "cust_id",
        "label": "รหัสลูกค้า",
        "type": "number"
      },
      {
        "key": "table_id",
        "label": "รหัสโต๊ะ",
        "type": "number"
      },
      {
        "key": "status",
        "label": "สถานะ",
        "type": "select",
        "options": [
          "",
          "open",
          "paid"
        ]
      }
    ],
    "form": [
      {
        "key": "cust_id",
        "label": "ลูกค้า",
        "type": "select",
        "optionsFrom": {
          "api": "/api/customers",
          "value": "cust_id",
          "label": "name"
        }
      },
      {
        "key": "table_id",
        "label": "รหัสโต๊ะ",
        "type": "number"
      },
      {
        "key": "order_time",
        "label": "เวลาสั่ง",
        "type": "datetime-local"
      },
      {
        "key": "status",
        "label": "สถานะ",
        "type": "select",
        "options": [
          "open",
          "paid"
        ]
      }
    ]
  },
  "orderitems": {
    "label": "รายการอาหารในออเดอร์",
    "api": "/api/order-items",
    "idKey": "order_id",
    "search": [
      {
        "key": "order_id",
        "label": "รหัสออเดอร์",
        "type": "number"
      },
      {
        "key": "item_id",
        "label": "รหัสเมนู",
        "type": "number"
      },
      {
        "key": "status",
        "label": "สถานะออเดอร์",
        "type": "select",
        "options": [
          "",
          "open",
          "paid"
        ]
      }
    ],
    "form": []
  }
};

let current = Object.keys(ENTITIES)[0];
let editingId = null;
let addingMenuToOrder = null;   // ถ้าไม่ null = กำลังเพิ่มเมนูในออเดอร์นี้
let comboManagerItem = null;    // เมนูชุดที่กำลังจัดการอยู่
// ฟอร์ม "เพิ่มเมนูในออเดอร์" (ตาราง order_item)
const ORDER_ITEM_FORM = [
  {
    "key": "item_id",
    "label": "เมนู",
    "type": "select",
    "optionsFrom": { "api": "/api/menu-items", "value": "item_id", "label": "name" }
  },
  { "key": "qty", "label": "จำนวน", "type": "number" },
  { "key": "note", "label": "หมายเหตุ", "type": "text" }
];
const $ = (s) => document.querySelector(s);
function setStatus(el, msg, cls = "") { el.className = "status " + cls; el.textContent = msg; }
async function api(url, opts) { const res = await fetch(url, opts); return res.json(); }

function fieldHtml(f, prefix, value = "") {
  if (f.type === "heading") return '<div class="form-section">' + f.label + '</div>';
  let input;
  if (f.type === "select") {
    // options เป็นข้อความ "a" หรือ {value, label} ก็ได้
    input = '<select id="' + prefix + f.key + '">' +
      f.options.map(o => {
        const v = typeof o === "object" ? o.value : o;
        const t = typeof o === "object" ? o.label : (o || "ทั้งหมด");
        return '<option value="' + v + '"' + (String(v) === String(value ?? "") ? " selected" : "") + '>' + t + '</option>';
      }).join("") + '</select>';
  } else { input = '<input id="' + prefix + f.key + '" type="' + f.type + '" value="' + (value ?? "") + '">'; }
  return '<div class="field"><label>' + f.label + '</label>' + input + '</div>';
}
// ช่อง select ที่มี optionsFrom → ดึงตัวเลือกจาก API (เช่น รายชื่อหมวดหมู่จากฐานข้อมูล)
async function loadOptions(fields, forSearch) {
  for (const f of fields.filter(f => f.optionsFrom)) {
    const src = f.optionsFrom, r = await api(src.api);
    f.options = r.ok ? (r.data || []).map(row => ({ value: row[src.value], label: row[src.label] }))
      : [{ value: "", label: (r.todo ? "🚧 " : "⚠️ ") + r.error }];
    if (forSearch && r.ok) f.options.unshift({ value: "", label: "ทั้งหมด" });
  }
}
// ช่องในฟอร์มที่ใช้อยู่ตอนนี้ (ช่อง editOnly แสดงเฉพาะตอนแก้ไข)
function formFields() { return ENTITIES[current].form.filter(f => !f.editOnly || editingId !== null); }
async function buildSearch() {
  const cfg = ENTITIES[current];
  await loadOptions(cfg.search, true);
  if (cfg !== ENTITIES[current]) return;   // ผู้ใช้เปลี่ยนแท็บระหว่างรอ
  $("#searchTitle").textContent = cfg.label;
  $("#searchFields").innerHTML = cfg.search.map(f => fieldHtml(f, "s_")).join("");
}
async function doSearch() {
  const cfg = ENTITIES[current];
  const params = new URLSearchParams();
  cfg.search.forEach(f => { const v = $("#s_" + f.key).value; if (v) params.append(f.key, v); });
  setStatus($("#status"), "กำลังค้นหา...");
  renderTable(await api(cfg.api + "?" + params.toString()));
}
function renderTable(r) {
  const head = $("#tableHead"), body = $("#tableBody"), st = $("#status");
  head.innerHTML = ""; body.innerHTML = "";
  if (!r.ok) { setStatus(st, (r.todo ? "🚧 " : "⚠️ ") + r.error, r.todo ? "todo" : "err"); return; }
  const rows = r.data || [];
  if (rows.length === 0) { setStatus(st, "ไม่พบข้อมูล"); return; }
  setStatus(st, "พบ " + rows.length + " รายการ");
  const cols = Object.keys(rows[0]).filter(c => !(current === "orderitems" && c === "รหัสเมนู"));
  head.innerHTML = cols.map(c => "<th>" + c + "</th>").join("") + "<th>จัดการ</th>";
  body.innerHTML = rows.map(row => {
    const id = row[ENTITIES[current].idKey];
    if (current === "orderitems") {
      const delButton = row["สถานะ"] === "open"
        ? '<button class="btn sm del" onclick="deleteOrderItem(' + row["ออเดอร์"] + ',' + row["รหัสเมนู"] + ')">ลบ</button>'
        : '';
      return "<tr>" + cols.map(c => "<td>" + (row[c] ?? "—") + "</td>").join("") +
        "<td>" + delButton + "</td></tr>";
    } else if (current === "orders") {
      const addButton = row.status === "open"
        ? '<button class="btn sm add" style="margin-left: 5px" onclick="addMenuToOrder(' + id + ')">เพิ่มอาหาร</button>'
        : '';
      return "<tr>" + cols.map(c => "<td>" + (row[c] ?? "—") + "</td>").join("") +
        '<td><button class="btn sm" onclick="editRow(' + id + ')">แก้ไข</button> ' +
        '<button class="btn sm del" onclick="deleteRow(' + id + ')">ลบ</button>' +
        addButton +
        '</td></tr>';
    } else if (current != "items") {
      return "<tr>" + cols.map(c => "<td>" + (row[c] ?? "—") + "</td>").join("") +
        '<td><button class="btn sm" onclick="editRow(' + id + ')">แก้ไข</button> ' +
        '<button class="btn sm del" onclick="deleteRow(' + id + ')">ลบ</button>' +
        '</td ></tr > ';
    } else {
      const isCombo = String(row.category || "").includes("ชุด") || String(row.name || "").includes("ชุด");
      const comboButton = isCombo
        ? '<button class="btn sm add" style="margin-left:5px" onclick="openComboManager(' + id + ')">จัดการชุด</button>'
        : '';
      return "<tr>" + cols.map(c => "<td>" + (row[c] ?? "—") + "</td>").join("") +
        '<td><button class="btn sm" onclick="editRow(' + id + ')">แก้ไข</button>' + comboButton + "</td></tr>";
    }
  }).join("");
}
async function openForm(title, data = {}) {
  await loadOptions(formFields(), false);
  $("#modalTitle").textContent = title;
  $("#formFields").innerHTML = formFields().map(f => fieldHtml(f, "f_", data[f.key])).join("");
  $("#modal").classList.remove("hidden");
}
function collectForm() { const d = {}; formFields().filter(f => f.key).forEach(f => d[f.key] = $("#f_" + f.key).value); return d; }
async function editRow(id) {
  const cfg = ENTITIES[current];
  addingMenuToOrder = null;
  const r = await api(cfg.api + "/" + id);
  if (!r.ok) { alert((r.todo ? "🚧 " : "⚠️ ") + r.error); return; }
  editingId = id; openForm("แก้ไขข้อมูล", r.data);
}
async function deleteRow(id) {
  if (!confirm("ยืนยันการลบ?")) return;
  const r = await api(ENTITIES[current].api + "/" + id, { method: "DELETE" });
  if (!r.ok) { alert((r.todo ? "🚧 " : "⚠️ ") + r.error); return; }
  doSearch();
}

async function deleteOrderItem(orderId, itemId) {
  if (!confirm("ยืนยันการลบรายการอาหารนี้?")) return;
  const r = await api("/api/order-items/" + orderId + "/" + itemId, { method: "DELETE" });
  if (!r.ok) { alert((r.todo ? "🚧 " : "⚠️ ") + r.error); return; }
  doSearch();
}

async function openComboManager(itemId) {
  comboManagerItem = itemId;
  const [combo, menu] = await Promise.all([
    api("/api/combos/" + itemId),
    api("/api/menu-items")
  ]);
  if (!combo.ok) {
    alert((combo.todo ? "🚧 " : "⚠️ ") + combo.error);
    comboManagerItem = null;
    return;
  }
  const data = combo.data;
  $("#comboTitle").textContent = "จัดการชุด: " + data.item.name;

  const list = $("#comboList");
  if (!data.components.length) {
    list.innerHTML = '<div class="status">ยังไม่มีส่วนประกอบ</div>';
  } else {
    list.innerHTML = data.components.map(c =>
      '<div class="combo-row"><span>' + c.name + ' × ' + c.amount + '</span>' +
      '<button class="btn sm del" onclick="removeComboComponent(' + c.item_id + ')">ลบ</button></div>'
    ).join("");
  }

  const currentAmounts = new Map(data.components.map(c => [String(c.item_id), c.amount]));
  const options = (menu.ok ? menu.data : [])
    .filter(m => String(m.item_id) !== String(itemId))
    .map(m => {
      const has = currentAmounts.get(String(m.item_id));
      const suffix = has ? ' (มีอยู่ ×' + has + ')' : '';
      return '<option value="' + m.item_id + '">' + m.name + ' — ' + m.category + suffix + '</option>';
    })
    .join("");
  $("#comboFormFields").innerHTML =
    '<div class="field"><label>ส่วนประกอบ</label><select id="comboSubItem">' +
      (options || '<option value="">ไม่มีเมนูให้เพิ่ม</option>') + '</select></div>' +
    '<div class="field"><label>จำนวน</label><input id="comboAmount" type="number" value="1" min="1"></div>';
  $("#comboModal").classList.remove("hidden");
}

async function addComboComponent() {
  if (comboManagerItem === null) return;
  const subItem = $("#comboSubItem").value;
  if (!subItem) { alert("ไม่มีเมนูให้เพิ่มในชุดนี้"); return; }
  const r = await api("/api/combos/" + comboManagerItem + "/components", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sub_item_id: subItem, amount: $("#comboAmount").value })
  });
  if (!r.ok) { alert((r.todo ? "🚧 " : "⚠️ ") + r.error); return; }
  openComboManager(comboManagerItem);
}

async function removeComboComponent(subItemId) {
  if (comboManagerItem === null) return;
  if (!confirm("ยืนยันการลบส่วนประกอบนี้ออกจากชุด?")) return;
  const r = await api("/api/combos/" + comboManagerItem + "/components/" + subItemId, { method: "DELETE" });
  if (!r.ok) { alert((r.todo ? "🚧 " : "⚠️ ") + r.error); return; }
  openComboManager(comboManagerItem);
}

async function addMenuToOrder(id) {
  editingId = null;
  addingMenuToOrder = id;
  await loadOptions(ORDER_ITEM_FORM, false);
  $("#modalTitle").textContent = "เพิ่มเมนูในออเดอร์ #" + id;
  $("#formFields").innerHTML = ORDER_ITEM_FORM.map(f => fieldHtml(f, "f_", f.key === "qty" ? 1 : "")).join("");
  $("#modal").classList.remove("hidden");
}
async function save() {
  if (addingMenuToOrder !== null) {
    const data = {};
    ORDER_ITEM_FORM.forEach(f => data[f.key] = $("#f_" + f.key).value);
    const r = await api("/api/orders/" + addingMenuToOrder + "/items",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!r.ok) { alert((r.todo ? "🚧 " : "⚠️ ") + r.error); return; }
    addingMenuToOrder = null;
    $("#modal").classList.add("hidden"); doSearch();
    return;
  }
  const cfg = ENTITIES[current], data = collectForm();
  const opts = { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
  const r = await api(editingId ? cfg.api + "/" + editingId : cfg.api, opts);
  if (!r.ok) { alert((r.todo ? "🚧 " : "⚠️ ") + r.error); return; }
  $("#modal").classList.add("hidden"); doSearch();
}
function updateActionButtons() {
  $("#btnAdd").style.display = current === "orderitems" ? "none" : "";
}

document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active"); current = t.dataset.entity;
  buildSearch(); $("#tableHead").innerHTML = ""; $("#tableBody").innerHTML = "";
  setStatus($("#status"), 'กด "ค้นหา" เพื่อแสดงข้อมูล');
  updateActionButtons();
}));
$("#btnSearch").onclick = doSearch;
$("#btnClear").onclick = () => buildSearch();
$("#btnAdd").onclick = () => { editingId = null; addingMenuToOrder = null; openForm("เพิ่มข้อมูลใหม่"); };
$("#btnComboAdd").onclick = addComboComponent;
$("#btnComboClose").onclick = () => { comboManagerItem = null; $("#comboModal").classList.add("hidden"); };
$("#btnSave").onclick = save;
$("#btnCancel").onclick = () => { addingMenuToOrder = null; $("#modal").classList.add("hidden"); };
buildSearch();
updateActionButtons();
setStatus($("#status"), 'กด "ค้นหา" เพื่อแสดงข้อมูล');
