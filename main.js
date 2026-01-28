//HTTP request get,get/id,post,put/id, delete/id
// Hàm tải dữ liệu bài viết
async function LoadData() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json()
        let body = document.getElementById("table-body");
        body.innerHTML = "";
        for (const post of posts) {
            // Kiểm tra trạng thái đã xoá mềm chưa, nếu rồi thì thêm class CSS để gạch ngang
            let rowClass = post.isDeleted ? "class='deleted-post'" : "";
            // Hiển thị nút sửa và xoá (xoá mềm)
            body.innerHTML += `<tr ${rowClass}>
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>
                    <button onclick='EditPost("${post.id}")'>Sửa</button>
                    <button onclick='Delete(${post.id})'>Xoá</button>
                </td>
            </tr>`
        }
    } catch (error) {
        console.log(error);
    }
}//

// Hàm lưu bài viết (Tạo mới hoặc Cập nhật)
async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;

    if (id) {
        // Nếu có ID -> Kiểm tra xem bài viết có tồn tại không (theo cấu trúc cũ)
        let getItem = await fetch("http://localhost:3000/posts/" + id);
        if (getItem.ok) {
            // Có item -> Sửa (PATCH để cập nhật các trường thay đổi)
            let res = await fetch('http://localhost:3000/posts/' + id,
                {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        {
                            title: title,
                            views: views
                        }
                    )
                })
            if (res.ok) {
                console.log("Cập nhật dữ liệu thành công");
            }
        }
    } else {
        // Không có ID -> Tạo mới (Auto ID)
        
        // 1. Tìm ID lớn nhất hiện tại
        let resArr = await fetch('http://localhost:3000/posts');
        let allPosts = await resArr.json();
        let maxId = 0;
        allPosts.forEach(p => {
            let pid = parseInt(p.id);
            if (!isNaN(pid) && pid > maxId) maxId = pid;
        });
        
        // 2. Tạo ID mới = maxId + 1 (dạng chuỗi)
        let newId = (maxId + 1).toString();

        let res = await fetch('http://localhost:3000/posts',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        id: newId,
                        title: title,
                        views: views,
                        isDeleted: false
                    }
                )
            })
        if (res.ok) {
            console.log("Thêm dữ liệu thành công");
        }
    }
    
    // Reset form
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("view_txt").value = "";
    LoadData();

}

// Hàm xoá bài viết (Xoá mềm)
async function Delete(id) {
    // Thay vì DELETE, dùng PATCH để cập nhật isDeleted: true
    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true })
    });
    if (res.ok) {
        console.log("Xoá mềm thành công");
    }
    LoadData();
}

// Hàm hỗ trợ điền dữ liệu sửa (Mới thêm)
async function EditPost(id) {
    let res = await fetch('http://localhost:3000/posts/' + id);
    let post = await res.json();
    document.getElementById("id_txt").value = post.id;
    document.getElementById("title_txt").value = post.title;
    document.getElementById("view_txt").value = post.views;
}

// --- PHẦN CRUD BÌNH LUẬN (MỚI THÊM) ---

async function LoadComments() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        let comments = await res.json();
        let body = document.getElementById("comment-body");
        body.innerHTML = "";
        for (const c of comments) {
            body.innerHTML += `<tr>
                <td>${c.id}</td>
                <td>${c.postId}</td>
                <td>${c.text}</td>
                <td>
                    <button onclick='EditComment("${c.id}")'>Sửa</button>
                    <button onclick='DeleteComment("${c.id}")'>Xoá</button>
                </td>
            </tr>`;
        }
    } catch (e) {
        console.log(e);
    }
}

async function SaveComment() {
    let id = document.getElementById("cmt_id_txt").value;
    let postId = document.getElementById("cmt_post_id_txt").value;
    let text = document.getElementById("cmt_text_txt").value;

    if (id) {
        // Sửa bình luận
        await fetch('http://localhost:3000/comments/' + id, {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId: postId, text: text })
        });
    } else {
        // Tạo bình luận mới (Auto ID theo maxId)
        let resArr = await fetch('http://localhost:3000/comments');
        let allCmts = await resArr.json();
        let maxId = 0;
        allCmts.forEach(c => {
            let cid = parseInt(c.id);
            if (!isNaN(cid) && cid > maxId) maxId = cid;
        });
        let newId = (maxId + 1).toString();

        await fetch('http://localhost:3000/comments', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: newId, postId: postId, text: text })
        });
    }
    
    document.getElementById("cmt_id_txt").value = "";
    document.getElementById("cmt_post_id_txt").value = "";
    document.getElementById("cmt_text_txt").value = "";
    LoadComments();
}

async function DeleteComment(id) {
    if(confirm("Bạn có chắc chắn muốn xoá bình luận này không?")) {
         await fetch('http://localhost:3000/comments/' + id, { method: 'DELETE' });
         LoadComments();
    }
}

async function EditComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id);
    let c = await res.json();
    document.getElementById("cmt_id_txt").value = c.id;
    document.getElementById("cmt_post_id_txt").value = c.postId;
    document.getElementById("cmt_text_txt").value = c.text;
}

LoadData();
LoadComments();
