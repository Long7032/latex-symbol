// ===== Init App =====
window.addEventListener("DOMContentLoaded", () => {
    // 1. Khởi tạo danh sách nhóm (category)
    fillCategoryFilter();

    // 2. Render bảng ban đầu
    render();

    // 3. Gắn sự kiện tìm kiếm theo text
    $q.addEventListener("input", render);

    // 4. Gắn sự kiện chọn category
    $cat.addEventListener("change", render);

    // 5. Gắn sự kiện copy tất cả
    $copyAll.addEventListener("click", handleCopyAll);
});

// ===== Copy All Handler =====
/**
 * Copy toàn bộ mã LaTeX của các item đang được filter.
 * - Nếu thành công: hiển thị trạng thái "Đã copy tất cả"
 * - Nếu thất bại: thông báo lỗi
 */
async function handleCopyAll() {
    const allCodes = filterItems().map(it => it.code).join(" ");

    try {
        await navigator.clipboard.writeText(allCodes);
        $copyAll.textContent = "Đã copy tất cả";
    } catch {
        alert("Copy không thành công. Hãy copy thủ công.");
    } finally {
        // Reset lại text của button sau 1 giây
        setTimeout(() => {
            $copyAll.textContent = "Copy tất cả";
        }, 1000);
    }
}
