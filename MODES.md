# Viết adapter cho chế độ mới (modes.js)

Một file `.js` được thêm trong Cài đặt → Thêm chế độ sẽ chạy với biến `OM`. Gọi `OM.register({...})`:

| Trường | Ý nghĩa |
|---|---|
| `id`, `name` | Mã và tên chế độ (hiện ở nút chế độ và Cài đặt) |
| `asm` | Tên ruleset trong `.dll` để khớp (mặc định = `id`), hoặc `match(info)` tự quyết định |
| `standalone: true` | Chế độ không cần `.dll` (tự có luật chơi và tài nguyên) |
| `build(info)` | Trả về assets. `info = {name, names, pngs:[Uint8Array], audio:[{type,bytes}], bytes}` (ảnh PNG và âm thanh nhúng trong `.dll`) |
| `icon(assets)` | Trả về dataURL icon cho nút chế độ |
| `support(M)` | Trả `''` nếu chơi được map `M`, hoặc câu báo lỗi |
| `settings` | `[{k,label,t:'seg',o:[[nhãn,giá trị]],def}]` hoặc `{t:'range',min,max,step,u,def}`: tự hiện trong Cài đặt |
| `start(ctx)` | Chạy ván chơi. `ctx = {M,F,buf,bg,note,A (assets),cfg (settings),restart(),quit()}` |

## Điều khiển dùng chung

```js
const S = OM.session({
  fw: 384, fh: 480,                         // kích thước sân (tỉ lệ)
  buttons: [{k:'f', label:'FOCUS', color:'#888'}],   // nút giữ bên phải ([] = không có)
  onPause(){}, onResume(){}, onRestart(){}, onQuit(){},
  onSkip(ms){ /* tua tới mốc ms của map */ },
  onLayout(){ /* vẽ lại khi xoay/đổi cỡ lúc đang pause */ }
});
// mỗi khung hình:
const I = S.read();      // {x,y (-1..1), f (Focus), b}  gộp cảm ứng + bàn phím + tay cầm
S.setSkip(ms | null);    // bật nút Skip (kèm mốc tua) hoặc ẩn
S.lay                    // {fx,fy,fw,fh,sc,hud:{x,w},act,pad,land}: bố cục sân/HUD để vẽ lên canvas `g`
S.close();               // khi kết thúc ván
```

`OM.needRotate()` / `OM.rotate(ok, back)` xử lý yêu cầu xoay ngang. Xem `touhosu.js` (đầy đủ) và `plugins/example-orbs.js` (tối giản, chạy được ngay) để làm mẫu.

## Giới hạn

- Trình duyệt không thể chạy code .NET trong `.dll`; với ruleset mới cần có adapter JS viết lại luật chơi.
- File `.js` chạy với toàn quyền trong trang: chỉ thêm plugin bạn tin tưởng.

## Tuỳ chọn mới của `OM.session` và màn tổng kết chung

```js
OM.session({ fw, fh, buttons: [], pad: false,       // pad:false = không có d-pad/joystick (chơi bằng chạm trực tiếp)
  keys: ['KeyZ','Space'], onKey(code, down){},      // phím riêng (Enter vẫn là Skip)
  onPtr(type, x, y, id){}                           // type 'd'|'m'|'u'; x,y theo toạ độ sân (fw×fh)
});

OM.results({ mode:'Tên', M, score, cells:[['300',n,'#6cf'],...], max, acc /*0..1*/, fail,
             miss /*tuỳ chọn*/, extra:[['Graze',12]], retry(){}, back(){} });
```
`OM.results` vẽ màn tổng kết giống hệt osu!/mania và phát âm applause; adapter mới nên dùng nó thay vì tự dựng HTML.
