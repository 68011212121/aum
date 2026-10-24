-- ============================================================
--  schema.sql — ระบบร้านอาหาร (นิสิตออกแบบและเขียนเอง)
--  กติกา: 1 ออเดอร์มีหลายเมนู (M:N: order × menu_item ผ่าน order_item),
--         เมนูชุด combo = M:N (menu_item × menu_item)
--  ต้องมี: PK ทุกตาราง, FK ครบ, ชื่อตรงกับ db.py, sample data
-- ============================================================

drop table if exists combo;
drop table if exists order_item;
drop table if exists food_order;
drop table if exists dining_table;
drop table if exists menu_item;
drop table if exists customer;

create table customer (
    cust_id          int auto_increment primary key,
    name             varchar(100)                             not null,
    phone            varchar(13)                              not null,
    member_tier      enum ('normal', 'silver', 'gold', 'vip') not null,
    invited_customer int,
    constraint inv_fk_cid foreign key (invited_customer) references customer (cust_id) on delete set null
);
create table menu_item (
    item_id  int auto_increment primary key,
    name     varchar(50)                                      not null,
    category varchar(50)                                      not null,
    price    int                                              not null,
    status   enum ('available','out_of_stock','discontinued') not null default 'available'
);
create table dining_table (
    table_id int auto_increment primary key,
    seats    int         not null,
    zone     varchar(50) not null
);
create table food_order (
    order_id   int auto_increment primary key,
    cust_id    int                  not null,
    table_id   int                  not null,
    order_time datetime             null,
    status     enum ('open','paid') not null,

    constraint cid_fk_cust foreign key (cust_id) references customer (cust_id) on delete cascade,
    constraint tid_fk_dt foreign key (table_id) references dining_table (table_id) on delete cascade

);
create table order_item (            -- M:N: food_order × menu_item
    order_id   int not null,
    item_id    int not null,
    qty        int not null,
    unit_price int not null,         -- ราคาต่อหน่วย ณ ตอนสั่ง (snapshot) ใช้คิดยอดขาย
    note       varchar(200),

    primary key (order_id, item_id), -- เมนูหนึ่งชนิดซ้ำในออเดอร์เดียวไม่ได้ (เก็บจำนวนใน qty)
    constraint order_fk_fo foreign key (order_id) references food_order (order_id) on delete cascade,
    constraint item_fk_mi foreign key (item_id) references menu_item (item_id) on delete restrict
);
create table combo (                    -- M:N: menu_item × menu_item
    item_id     int not null,
    sub_item_id int not null,
    amount      int not null,

    primary key (item_id, sub_item_id), -- เมนูย่อยชนิดเดียวกันซ้ำในชุดเดียวไม่ได้
    constraint combo_fk_mi foreign key (item_id) references menu_item (item_id) on delete restrict,
    constraint subitem_fk_mi foreign key (sub_item_id) references menu_item (item_id) on delete restrict,
    constraint combo_amount_positive check (amount > 0)

);


-- ============================================================
--  insert_sample.sql — ข้อมูลตัวอย่างสำหรับ schema.sql (ระบบร้านอาหาร)
--  ลำดับการ INSERT ต้องเรียงตามนี้ เพราะมี FK อ้างอิงกัน:
--  customer -> menu_item -> dining_table -> food_order -> order_item -> combo
-- ============================================================

-- ------------------------------------------------------------
-- 1) customer (8 แถว)
--    invited_customer อ้างถึง cust_id ของคนที่ชวนมา (NULL = สมัครเอง)
--    จึงต้องใส่คนที่ถูกอ้างถึงก่อนเสมอ
-- ------------------------------------------------------------
insert into customer (name, phone, member_tier, invited_customer)
values ('สมชาย ใจดี', '081-234-5678', 'gold', null),     -- cust_id = 1
       ('สมหญิง รักเรียน', '082-345-6789', 'vip', null), -- cust_id = 2
       ('วิชัย มั่นคง', '083-456-7890', 'silver', 1),    -- cust_id = 3 (สมชายชวนมา)
       ('นภา ศรีสุข', '084-567-8901', 'normal', 1),      -- cust_id = 4 (สมชายชวนมา)
       ('ธนากร แสงทอง', '085-678-9012', 'silver', 2),    -- cust_id = 5 (สมหญิงชวนมา)
       ('พิมพ์ชนก ดวงดี', '086-789-0123', 'normal', 2),  -- cust_id = 6 (สมหญิงชวนมา)
       ('อนุชา พงษ์ไพร', '087-890-1234', 'normal', 3),   -- cust_id = 7 (วิชัยชวนมา)
       ('กมลวรรณ เจริญผล', '088-901-2345', 'gold', 5);
-- cust_id = 8 (ธนากรชวนมา)

-- ------------------------------------------------------------
-- 2) menu_item (10 แถว)  is_available: 1 = มีขาย, 0 = หมด
--    item_id 9 และ 10 เป็นเมนูชุด (combo) ดูรายละเอียดในตาราง combo
-- ------------------------------------------------------------
insert into menu_item (name, category, price, status)
values ('ข้าวกะเพราหมูสับ', 'อาหารจานเดียว', 60, 'available'), -- 1
       ('ต้มยำกุ้ง', 'ต้ม/แกง', 180, 'available'),             -- 2
       ('ส้มตำไทย', 'ยำ/ส้มตำ', 50, 'available'),              -- 3
       ('ไก่ทอด', 'ของทอด', 80, 'available'),                  -- 4
       ('ข้าวสวย', 'ข้าว', 15, 'available'),                   -- 5
       ('น้ำเปล่า', 'เครื่องดื่ม', 10, 'available'),           -- 6
       ('ชาเย็น', 'เครื่องดื่ม', 40, 'available'),             -- 7
       ('ผัดไทยกุ้งสด', 'อาหารจานเดียว', 90, 'out_of_stock'),  -- 8 (วัตถุดิบหมด)
       ('ชุดส้มตำไก่ทอด', 'เมนูชุด', 149, 'available'),        -- 9  (combo)
       ('ชุดกะเพราเซ็ต', 'เมนูชุด', 99, 'available'),          -- 10 (combo)
       ('ข้าวผัดปู', 'อาหารจานเดียว', 120, 'discontinued');
-- 11 (เลิกขายถาวร)

-- ------------------------------------------------------------
-- 3) dining_table (7 แถว)
-- ------------------------------------------------------------
insert into dining_table (seats, zone)
values (2, 'ในร้าน'),      -- 1
       (4, 'ในร้าน'),      -- 2
       (4, 'ริมหน้าต่าง'), -- 3
       (6, 'ห้อง VIP'),    -- 4
       (8, 'ห้อง VIP'),    -- 5
       (2, 'สวนนอกร้าน'),  -- 6
       (4, 'สวนนอกร้าน');
-- 7

-- ------------------------------------------------------------
-- 4) food_order (10 แถว)  order_time เป็นชนิด DATE ตาม schema
-- ------------------------------------------------------------
insert into food_order (cust_id, table_id, order_time, status)
values (1, 1, '2026-09-14', 'paid'), -- 1
       (2, 2, '2026-09-14', 'paid'), -- 2
       (3, 4, '2026-09-15', 'paid'), -- 3
       (4, 3, '2026-09-16', 'paid'), -- 4
       (5, 6, '2026-09-17', 'paid'), -- 5
       (2, 5, '2026-09-18', 'open'), -- 6
       (6, 7, '2026-09-18', 'open'), -- 7
       (7, 2, '2026-09-19', 'open'), -- 8
       (1, 3, '2026-09-19', 'open'), -- 9
       (8, 1, '2026-09-19', 'open');
-- 10

-- ------------------------------------------------------------
-- 5) order_item (20 แถว)  PK = (order_id, item_id) ห้ามซ้ำในออเดอร์เดียวกัน
-- ------------------------------------------------------------
insert into order_item (order_id, item_id, qty, unit_price, note)
values (1, 1, 2, 60, 'ไม่เผ็ด'),
       (1, 6, 2, 10, null),
       (2, 9, 1, 149, null),
       (2, 7, 1, 40, 'หวานน้อย'),
       (3, 2, 1, 180, 'เผ็ดน้อย'),
       (3, 4, 2, 80, null),
       (3, 5, 4, 15, null),
       (3, 3, 1, 50, 'ไม่ใส่ปลาร้า'),
       (4, 10, 2, 99, null),
       (5, 3, 2, 50, 'เผ็ดมาก'),
       (5, 4, 1, 80, null),
       (6, 2, 2, 180, null),
       (6, 5, 6, 15, null),
       (6, 7, 3, 40, null),
       (7, 1, 1, 60, null),
       (8, 4, 3, 80, null),
       (8, 3, 1, 50, null),
       (8, 6, 2, 10, null),
       (9, 9, 1, 149, null),
       (10, 1, 1, 60, 'ไข่ดาวสุกมาก');

-- ------------------------------------------------------------
-- 6) combo (7 แถว)
--    item_id     = เมนูชุด (แม่)
--    sub_item_id = เมนูย่อยที่อยู่ในชุด
--    amount      = จำนวนของเมนูย่อยในชุดนั้น
-- ------------------------------------------------------------
insert into combo (item_id, sub_item_id, amount)
values (9, 3, 1),  -- ชุดส้มตำไก่ทอด = ส้มตำไทย 1
       (9, 4, 1),  --                 + ไก่ทอด 1
       (9, 5, 2),  --                 + ข้าวสวย 2
       (9, 6, 2),  --                 + น้ำเปล่า 2
       (10, 1, 1), -- ชุดกะเพราเซ็ต    = ข้าวกะเพราหมูสับ 1
       (10, 7, 1), --                 + ชาเย็น 1
       (10, 6, 1);
--                 + น้ำเปล่า 1
-- TODO: INSERT ข้อมูลตัวอย่างทุกตารา
