# ============================================================
#  db.py — ชั้นติดต่อฐานข้อมูล  ★★★ นิสิตเขียน SQL ในไฟล์นี้ ★★★
#  มองหาคำว่า  # TODO  ทุกฟังก์ชัน — ใช้ %s เป็น placeholder เสมอ (กัน SQL injection)
# ============================================================
import mysql.connector
import config


def get_connection():
    return mysql.connector.connect(
        host=config.DB_HOST, user=config.DB_USER, password=config.DB_PASSWORD,
        database=config.DB_NAME, port=config.DB_PORT)


def run_query(sql, params=None):
    conn = get_connection(); 
    cur = conn.cursor(dictionary=True)
    cur.execute(sql, params or ());
    rows = cur.fetchall()
    cur.close(); conn.close(); return rows


def run_command(sql, params=None):
    conn = get_connection(); cur = conn.cursor()
    cur.execute(sql, params or ());
    conn.commit()
    out = {"new_id": cur.lastrowid, "affected": cur.rowcount}
    cur.close(); conn.close(); return out


def blank_to_none(value):
    return None if value in ("", None) else value


def _todo(name):
    raise NotImplementedError(f"TODO: ยังไม่ได้เขียนฟังก์ชัน {name} ใน db.py")


# ---------- ลูกค้า (customer) ----------
def search_customers(filters):
    sql = """
    select c.cust_id,
       c.name,
       c.phone,
       c.member_tier,
       (select name from customer where cust_id = c.invited_customer) as 'invited names'
    from customer as c
    where 1 = 1
    """
    params = []
    if filters.get("name"):
        sql += " AND name LIKE %s"
        params.append("%" + filters["name"] + "%")
    if filters.get("phone"):
        sql += " AND phone LIKE %s"
        params.append("%" + filters["phone"] + "%")
    if filters.get("invited_customer"):
        sql += " AND invited_customer = %s"
        params.append(filters["invited_customer"])
    if filters.get("member_tier"):
        sql += " AND member_tier = %s"
        params.append(filters["member_tier"])
    sql += " ORDER BY cust_id"
    return run_query(sql, params)
    


def get_customer(cust_id):
    rows = run_query("SELECT * FROM customer WHERE cust_id = %s", (cust_id,))
    return rows[0] if rows else None


def create_customer(data):
    sql = """INSERT INTO customer (name, phone, invited_customer, member_tier)
             VALUES (%s, %s, %s, %s)"""
    return run_command(sql, (data["name"], data["phone"],
                             blank_to_none(data.get("invited_customer")), data["member_tier"]))


def update_customer(cust_id, data):
    sql = """UPDATE customer
             SET name = %s, phone = %s, invited_customer = %s, member_tier = %s
             WHERE cust_id = %s"""
    return run_command(sql, (data["name"], data["phone"],
                             blank_to_none(data.get("invited_customer")),
                             data["member_tier"], cust_id))


def delete_customer(cust_id):
    return run_command("delete from customer where cust_id=%s", [cust_id])

# ---------- เมนูอาหาร (menu_item) ----------
def search_items(filters):
    sql = """select m.item_id, m.name, m.category, m.price,
    CASE m.status
        WHEN 'available'    THEN 'ขายปกติ'
        WHEN 'out_of_stock' THEN 'หมด'
        ELSE 'ยกเลิกถาวร'
    END as status
    from menu_item m where 1=1"""
    params = []
    if filters.get("name"):
        sql += " AND m.name LIKE %s"
        params.append("%" + filters["name"] + "%")
    if filters.get("category"):
        sql += " AND m.category LIKE %s"
        params.append("%" + filters["category"] + "%")
    if filters.get("status"):
        sql += " AND m.status = %s"
        params.append(filters["status"])
    sql += " ORDER BY m.item_id"
    return run_query(sql, params)


def get_item(item_id):
    rows = run_query("select * from menu_item where item_id = %s limit 1", [item_id])
    if not rows:
        raise ValueError(f"ไม่พบเมนู {item_id}")
    return rows[0]


def create_item(data):
    sql = "insert into menu_item (name,category,price,status) values (%s,%s,%s,%s)"
    return run_command(sql, [data["name"], data["category"], data["price"],
                             data.get("status") or "available"])

def update_item(item_id, data):
    sql = "update menu_item set name = %s, category = %s, price = %s, status = %s where item_id = %s"
    return run_command(sql, [data["name"], data["category"], data["price"],
                             data.get("status") or "available", item_id])


def delete_item(item_id):
    raise ValueError("ระบบไม่ลบเมนู — ใช้การเปลี่ยนสถานะเป็น 'ยกเลิกถาวร' แทน")

# ---------- โต๊ะอาหาร (dining_table) ----------
def search_tables(filters):
    sql = "SELECT table_id, seats, zone FROM dining_table WHERE 1=1"
    params = []
    if filters.get("seats"):
        sql += " AND seats = %s"
        params.append(filters["seats"])
    if filters.get("zone"):
        sql += " AND zone LIKE %s"
        params.append("%" + filters["zone"] + "%")
    sql += " ORDER BY table_id"
    return run_query(sql, params)


def get_table(table_id):
    rows = run_query("SELECT * FROM dining_table WHERE table_id = %s", [table_id])
    if not rows:
        raise ValueError(f"ไม่พบโต๊ะ {table_id}")
    return rows[0]


def create_table(data):
    return run_command("INSERT INTO dining_table (seats, zone) VALUES (%s, %s)",
                       [data["seats"], data["zone"]])


def update_table(table_id, data):
    return run_command("UPDATE dining_table SET seats = %s, zone = %s WHERE table_id = %s",
                       [data["seats"], data["zone"], table_id])


def delete_table(table_id):
    if not run_query("SELECT table_id FROM dining_table WHERE table_id = %s", [table_id]):
        raise ValueError(f"ไม่พบโต๊ะ {table_id}")
    if run_query("SELECT order_id FROM food_order WHERE table_id = %s LIMIT 1", [table_id]):
        raise ValueError("ลบโต๊ะไม่ได้ เพราะยังมีออเดอร์ที่ใช้โต๊ะนี้")
    return run_command("DELETE FROM dining_table WHERE table_id = %s", [table_id])


# ---------- ออเดอร์ (food_order) ----------
def search_orders(filters):
    sql = """
        select fo.order_id, fo.cust_id, c.name, fo.table_id, fo.order_time, fo.status,
               IFNULL(SUM(oi.qty * oi.unit_price), 0) as total
        from food_order fo
        join customer c on c.cust_id = fo.cust_id
        left join order_item oi on oi.order_id = fo.order_id
        where 1=1
        """
    params = []

    if filters.get("cust_id"):
        sql += " and fo.cust_id = %s"
        params.append(filters["cust_id"])

    if filters.get("table_id"):
        sql += " and fo.table_id = %s"
        params.append(filters["table_id"])

    if filters.get("status"):
        sql += " and fo.status = %s"
        params.append(filters["status"])

    sql += """ group by fo.order_id, fo.cust_id, c.name, fo.table_id, fo.order_time, fo.status
               order by fo.order_id"""
    return run_query(sql, params)


def get_order(order_id):
    rows = run_query("SELECT * FROM food_order WHERE order_id = %s limit 1", [order_id])
    if not rows:
        raise ValueError(f"ไม่พบออเดอร์ {order_id}")
    return rows[0]


def check_table_free(table_id, order_id=None):
    if run_query("select * from dining_table where table_id = %s", [table_id]):
        value = run_query("select count(*) as n from food_order where table_id = %s and status = 'open' and order_id <> %s", [table_id, 0 if order_id is None else order_id])
        if value[0].get('n') > 0:
            raise ValueError("โต๊ะไม่ว่าง")
    else:
        raise ValueError("ไม่มีโต๊ะนี้")

def create_order(data):
    if data.get("status") == "open":
        check_table_free(data.get("table_id"))
    return run_command("insert into food_order (cust_id,table_id,order_time,status) values (%s,%s,%s,%s)",[data["cust_id"],data["table_id"],blank_to_none(data.get("order_time")),data["status"]])


def update_order(order_id, data):
    if data.get("status") == 'open':
        check_table_free(data.get("table_id"),order_id)
    return run_command('update food_order set cust_id = %s, table_id = %s, order_time = %s, status = %s where order_id=%s',[data.get("cust_id"),data.get("table_id"),blank_to_none(data.get("order_time")),data.get("status"),order_id])

def delete_order(order_id):
    return run_command("delete from food_order where order_id=%s",[order_id])

def add_menu_to_order(order_id, data):
    try:
        item_id = int(data.get("item_id"))
    except (TypeError, ValueError):
        raise ValueError("กรุณาเลือกเมนู")
    items = run_query("SELECT price, status FROM menu_item WHERE item_id = %s", (item_id,))
    if items[0]["status"] != "available":
        raise ValueError("เมนูนี้ไม่พร้อมขาย (สถานะไม่ใช่ 'ขายปกติ')")

    try:
        qty = int(data.get("qty"))
    except (TypeError, ValueError):
        raise ValueError("จำนวนต้องเป็นตัวเลข")
    if qty < 1:
        raise ValueError("จำนวนต้องมากกว่า 0")

    note = blank_to_none(data.get("note"))
    sql = """INSERT INTO order_item (order_id, item_id, qty, unit_price, note)
             VALUES (%s, %s, %s, %s, %s)
             ON DUPLICATE KEY UPDATE qty = qty + %s, note = COALESCE(%s, note)"""
    return run_command(sql, (order_id, item_id, qty, items[0]["price"], note, qty, note))


# ---------- รายการอาหารในออเดอร์ (order_item) ----------
def search_order_items(filters):
    """ค้นหา รายการอาหารในออเดอร์ พร้อมชื่อลูกค้า/โต๊ะ/เมนู"""
    sql = """SELECT oi.order_id AS 'ออเดอร์',
                    c.name AS 'ลูกค้า',
                    fo.table_id AS 'โต๊ะ',
                    mi.name AS 'เมนู',
                    oi.qty AS 'จำนวน',
                    oi.unit_price AS 'ราคาต่อหน่วย',
                    oi.qty * oi.unit_price AS 'รวม',
                    oi.note AS 'หมายเหตุ',
                    fo.status AS 'สถานะ',
                    oi.item_id AS 'รหัสเมนู'
             FROM order_item oi
             INNER JOIN food_order fo ON fo.order_id = oi.order_id
             INNER JOIN customer c ON c.cust_id = fo.cust_id
             INNER JOIN menu_item mi ON mi.item_id = oi.item_id
             WHERE 1=1"""
    params = []
    if filters.get("order_id"):
        sql += " AND oi.order_id = %s"
        params.append(filters["order_id"])
    if filters.get("item_id"):
        sql += " AND oi.item_id = %s"
        params.append(filters["item_id"])
    if filters.get("status"):
        sql += " AND fo.status = %s"
        params.append(filters["status"])
    sql += " ORDER BY oi.order_id, oi.item_id"
    return run_query(sql, params)


def delete_order_item(order_id, item_id):
    """ลบเมนูออกจากออเดอร์"""
    return run_command("DELETE FROM order_item WHERE order_id = %s AND item_id = %s",
                       [order_id, item_id])


# ---------- เมนูชุด (combo) ----------
def get_combo(item_id):
    """ดึงเมนูชุดและส่วนประกอบทั้งหมด"""
    items = run_query("""SELECT item_id, name, category, price, status
                         FROM menu_item WHERE item_id = %s""", [item_id])
    if not items:
        raise ValueError(f"ไม่พบเมนู {item_id}")
    components = run_query("""SELECT s.item_id, s.name, s.category, s.price, c.amount
                              FROM combo c
                              INNER JOIN menu_item s ON s.item_id = c.sub_item_id
                              WHERE c.item_id = %s
                              ORDER BY s.item_id""", [item_id])
    return {"item": items[0], "components": components}


def add_combo_component(item_id, data):
    """เพิ่มหรือแก้จำนวนส่วนประกอบของเมนูชุด — data มีคีย์: sub_item_id, amount"""
    try:
        sub_item_id = int(data.get("sub_item_id"))
        amount = int(data.get("amount"))
    except (TypeError, ValueError):
        raise ValueError("กรุณาเลือกส่วนประกอบและจำนวน")
    if amount < 1:
        raise ValueError("จำนวนต้องมากกว่า 0")
    sql = """INSERT INTO combo (item_id, sub_item_id, amount)
             VALUES (%s, %s, %s)
             ON DUPLICATE KEY UPDATE amount = VALUES(amount)"""
    return run_command(sql, [item_id, sub_item_id, amount])


def delete_combo_component(item_id, sub_item_id):
    """ลบส่วนประกอบออกจากเมนูชุด"""
    return run_command("DELETE FROM combo WHERE item_id = %s AND sub_item_id = %s",
                       [item_id, sub_item_id])


def report_summary():
    sql="""SELECT
            (SELECT COUNT(*) FROM customer) AS 'ลูกค้า',
            (SELECT COUNT(*) FROM menu_item) AS 'เมนู',
            (SELECT COUNT(*) FROM food_order) AS 'ออเดอร์',
            (SELECT IFNULL(SUM(qty * unit_price), 0) FROM order_item) AS 'ยอดขายรวม',
            (SELECT COUNT(*) FROM customer WHERE member_tier IN ('normal','silver')) AS 'Normal Tier Customers',
            (SELECT COUNT(*) FROM customer WHERE member_tier IN ('gold','vip')) AS 'High Tier Customers'
          """
    return run_query(sql)[0]

def report_popular_items():
    sql = """SELECT mi.name AS 'เมนู',
                    COUNT(DISTINCT fo.order_id) AS 'จำนวนออเดอร์',
                    SUM(oi.qty) AS 'จำนวนขาย'
             FROM food_order fo
             JOIN order_item oi ON fo.order_id = oi.order_id
             JOIN menu_item mi ON oi.item_id = mi.item_id
             GROUP BY mi.item_id, mi.name
             ORDER BY SUM(oi.qty) DESC
             LIMIT 5"""
    return run_query(sql)

def report_daily_sales():
    sql = """SELECT DATE(fo.order_time) AS 'วันที่',
                    COUNT(DISTINCT mi.item_id) AS 'จำนวนเมนูที่ขาย',
                    SUM(oi.qty * oi.unit_price) AS 'ยอดขายรวม'
             FROM food_order fo
             JOIN order_item oi ON fo.order_id = oi.order_id
             JOIN menu_item mi ON oi.item_id = mi.item_id
             GROUP BY DATE(fo.order_time)
             ORDER BY DATE(fo.order_time)"""
    return run_query(sql)

def report_big_orders():
    sql = """SELECT fo.order_id AS 'ออเดอร์',
                    COUNT(DISTINCT mi.item_id) AS 'จำนวนเมนู',
                    SUM(oi.qty * oi.unit_price) AS 'ยอดรวม'
             FROM food_order fo
             JOIN order_item oi ON fo.order_id = oi.order_id
             JOIN menu_item mi ON oi.item_id = mi.item_id
             GROUP BY fo.order_id
             HAVING SUM(oi.qty * oi.unit_price) > 500
             ORDER BY fo.order_id"""
    return run_query(sql)

def report_combo_sales():
    sql = """SELECT
                m.name AS 'เมนูชุด',
                m.price AS 'ราคา',
                GROUP_CONCAT(CONCAT(s.name, ' × ', c.amount)
                             ORDER BY s.item_id SEPARATOR ' + ') AS 'ส่วนประกอบ',
                COALESCE(sales.qty_sold, 0) AS 'จำนวนที่ขาย',
                COALESCE(sales.revenue, 0) AS 'ยอดขายรวม'
             FROM menu_item m
              JOIN combo c ON c.item_id = m.item_id
              JOIN menu_item s ON s.item_id = c.sub_item_id
             LEFT JOIN (
                 SELECT oi.item_id,
                        SUM(oi.qty) AS qty_sold,
                        SUM(oi.qty * oi.unit_price) AS revenue
                 FROM order_item oi
                 GROUP BY oi.item_id
             ) sales ON sales.item_id = m.item_id
             GROUP BY m.item_id, m.name, m.price, sales.qty_sold, sales.revenue
             ORDER BY sales.revenue DESC, m.item_id"""
    return run_query(sql)

REPORTS = [
    ("popular-items", "📈 เมนูขายดี (Best Sellers)",        report_popular_items),
    ("daily-sales",   "💰 ยอดขายรวมต่อวัน (Daily Sales)",   report_daily_sales),
    ("big-orders",    "🧾 ออเดอร์ยอดเกิน 500 บาท (HAVING)", report_big_orders),
    ("combo-sales",   "🍱 ยอดขายเมนูชุด (Combo Sales)",      report_combo_sales),
]
