// ===== Constants =====
const $body = document.getElementById("body");
const $count = document.getElementById("count");
const $cat = document.getElementById("cat");
const $q = document.getElementById("q");
const $copyAll = document.getElementById("copyAll");

const TEXTS = {
    noResult: "Không có mục phù hợp.",
    copy: "Copy",
    copied: "Đã copy",
    copyFail: "Copy không thành công. Hãy copy thủ công: "
};

// ===== Helpers =====
/**
 * Helper tạo DOM element an toàn, gọn gàng.
 *
 * @param {string} tag - Tên thẻ HTML (ví dụ: "div", "span", "button").
 * @param {Object} props - Các thuộc tính (property/attribute) muốn gán cho element.
 *   - Nếu key tồn tại trong element (vd: `textContent`, `className`, `id`...) → gán trực tiếp.
 *   - Nếu không tồn tại → dùng `setAttribute` (vd: `data-*`, `aria-*`...).
 * @param {HTMLElement[]} children - Danh sách node con sẽ được append vào element.
 * @returns {HTMLElement} - Trả về DOM element đã tạo.
 *
 * Ví dụ:
 *   const btn = createEl("button", {
 *       className: "btn btn-primary",
 *       textContent: "Click me",
 *       "data-id": "123"
 *   });
 */
function createEl(tag, props = {}, children = []) {
    const el = document.createElement(tag);

    // Gán props (property hoặc attribute)
    Object.entries(props).forEach(([k, v]) => {
        if (k in el) {
            // Nếu là property hợp lệ (vd: el.textContent, el.className)
            el[k] = v;
        } else {
            // Nếu không phải property → gán attribute (vd: data-*, aria-*)
            el.setAttribute(k, v);
        }
    });

    // Thêm node con
    children.forEach(c => el.appendChild(c));

    return el;
}
/**
 * Xóa sạch toàn bộ con trong 1 element (clear inner content).
 * @param {HTMLElement} el
 */
function clearEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
}

// ===== Row builder =====
/**
 * Tạo 1 hàng (tr) trong bảng từ dữ liệu item.
 * Sử dụng createEl để đảm bảo an toàn (không dùng innerHTML).
 * 
 * @param {Object} item - Dữ liệu 1 ký hiệu toán học.
 * @param {number} idx - Chỉ số (dùng để đặt id cho MathJax).
 * @returns {HTMLTableRowElement}
 */
function createRow(item, idx) {
    const span = createEl("span", {
        id: `mj-${idx}`,
        textContent: `\\(${item.display}\\)` // render bằng MathJax
    });

    const code = createEl("code", {
        className: "code",
        textContent: item.code
    });

    const btn = createEl("button", {
        className: "btn btn-sm btn-primary",
        type: "button",
        textContent: TEXTS.copy
    });
    btn.dataset.copy = item.code; // lưu LaTeX code vào dataset
    btn.onclick = () => handleCopy(btn, item.code);

    return createEl("tr", {}, [
        createEl("td", { textContent: item.cat }),
        createEl("td", { className: "symbol" }, [span]),
        createEl("td", {}, [code]),
        createEl("td", { textContent: item.desc }),
        createEl("td", {}, [btn])
    ]);
}

// ===== Copy handler =====
/**
 * Xử lý khi bấm nút copy:
 * - Copy text vào clipboard
 * - Hiển thị trạng thái "Đã copy" trong 0.9s
 * - Nếu thất bại → thông báo lỗi
 * 
 * @param {HTMLButtonElement} btn 
 * @param {string} text 
 */
async function handleCopy(btn, text) {
    try {
        await navigator.clipboard.writeText(text);
        btn.textContent = TEXTS.copied;
        setTimeout(() => (btn.textContent = TEXTS.copy), 900);
    } catch {
        alert(TEXTS.copyFail + text);
    }
}

// ===== Filter logic =====
/**
 * Lọc ITEMS dựa trên query (q) và category (cat).
 * - Nếu cat = "" → không lọc theo nhóm
 * - Nếu q = "" → không lọc theo từ khóa
 * 
 * @returns {Array} Danh sách item phù hợp
 */
function filterItems() {
    const q = $q.value.trim().toLowerCase();
    const cat = $cat.value;

    return ITEMS.filter(it => {
        const inCat = !cat || it.cat === cat;
        const inQuery =
            !q ||
            [it.cat, it.code, it.desc]
                .some(f => f.toLowerCase().includes(q));
        return inCat && inQuery;
    });
}

// ===== Render =====
/**
 * Render bảng dựa trên kết quả filter.
 * - Nếu không có kết quả → hiển thị dòng "Không có mục phù hợp".
 * - Nếu có kết quả → render từng row.
 * - Cập nhật số lượng kết quả.
 * - Gọi MathJax để render lại ký hiệu toán học.
 */
async function render() {
    const items = filterItems();
    clearEl($body);

    if (items.length === 0) {
        const td = createEl("td", {
            colSpan: 5,
            className: "text-center text-muted",
            textContent: TEXTS.noResult
        });
        $body.appendChild(createEl("tr", {}, [td]));
    } else {
        items.forEach((it, idx) => $body.appendChild(createRow(it, idx)));
    }

    $count.textContent = items.length;

    // Render lại chỉ phần body bằng MathJax
    if (window.MathJax?.typesetPromise) {
        await MathJax.typesetPromise([$body]);
    }
}

// ===== Category filter =====
/**
 * Đổ danh sách nhóm (category) vào select box.
 * - Lấy toàn bộ cat từ ITEMS
 * - Loại trùng, sort
 * - Thêm option vào $cat
 */
function fillCategoryFilter() {
    const cats = [...new Set(ITEMS.map(it => it.cat))].sort();
    cats.forEach(c => {
        $cat.appendChild(createEl("option", {
            value: c,
            textContent: c
        }));
    });
}
