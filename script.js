/* ===== DỮ LIỆU SẢN PHẨM =====
   Mỗi sản phẩm có nhiều quy cách (sizes). price: null sẽ hiển thị [GIÁ].
   img: đường dẫn ảnh trong thư mục images; bỏ trường img nếu chưa có ảnh. */
const DELIVERY_FEE = null; // điền phí giao hàng thật, ví dụ 20000
const PRODUCTS = [
  {id:1,cat:'plain',emoji:'🥛',img:'images/suachuanguyenban.jpg',name:'Sữa chua Nguyên bản',flavor:'Nguyên bản, không đường',
   sizes:[{label:'Hộp nhỏ',price:7000},{label:'Hộp lớn (300g)',price:30000}],
   desc:'Sữa chua nguyên bản, không đường, dành cho người quan tâm đến sức khỏe.',
   ing:'100% sữa tươi',ben:'Sạch, không đường, dễ kết hợp cùng hạt hoặc trái cây.'},
  {id:2,cat:'sweet',emoji:'🍶',img:'images/suachuacoduong.jpg',name:'Sữa chua Có đường',flavor:'Ngọt dịu, mềm mịn',
   sizes:[{label:'Hộp nhỏ',price:7000},{label:'Hộp lớn (300g)',price:30000}],
   desc:'Sữa chua có đường, hương vị mềm mịn, phù hợp dùng hằng ngày.',
   ing:'100% sữa tươi, đường',ben:'Hương vị mềm mịn, tiện dùng mỗi ngày.'},
  {id:3,cat:'fruit',emoji:'🍓',img:'images/suachuatraicay.jpg',name:'Sữa chua Trái cây',flavor:'Dâu tây / Bơ / Đào',flavors:['Dâu tây','Bơ','Đào'],
   sizes:[{label:'Cốc nhỏ (100g)',price:7000},{label:'Hộp lớn (300g)',price:30000}],
   desc:'Sữa chua kết hợp trái cây đặc sản Đà Lạt.',
   ing:'100% sữa tươi, trái cây đặc sản Đà Lạt; không dùng hương liệu tổng hợp và puree nhân tạo',ben:'Hương vị trái cây tự nhiên, nhiều lựa chọn.'},
  {id:4,cat:'nut',emoji:'🥜',img:'images/suachuahat.jpg',name:'Sữa chua Hạt dinh dưỡng',flavor:'Các loại hạt',
   sizes:[{label:'Hộp nhỏ',price:7000},{label:'Hộp lớn (300g)',price:30000}],
   desc:'Sữa chua kết hợp các loại hạt, phát triển cùng Doha Food.',
   ing:'100% sữa tươi, các loại hạt (hợp tác cùng Doha Food)',ben:'Cung cấp chất xơ và chất béo lành mạnh.'},
  {id:5,cat:'freeze',emoji:'❄️',img:'images/suachuasay.jpg',name:'Sữa chua Sấy thăng hoa',flavor:'Snack giòn',
   sizes:[{label:'Gói (100g)',price:30000}],
   desc:'Sữa chua sấy thăng hoa dạng snack giòn, tiện lợi, không dính tay.',
   ing:'Sữa chua sấy thăng hoa',ben:'Giữ lại lợi khuẩn, dưỡng chất và hương vị tự nhiên; dễ bảo quản.'}
];
const CATS={all:'Tất cả',plain:'Nguyên bản',sweet:'Có đường',fruit:'Trái cây',nut:'Hạt dinh dưỡng',freeze:'Sấy thăng hoa'};
const SWEET=['Không ngọt','Ít ngọt','Vừa','Ngọt nhiều'];
const ADDONS=['Dâu tây','Bơ','Đào','Hạnh nhân','Hạt điều','Hạt chia'];

/* ===== TIỆN ÍCH ===== */
const $=s=>document.querySelector(s);
const fmt=(n,ph='[GIÁ]')=>n==null?ph:n.toLocaleString('vi-VN')+'đ';
const sizeOpt=s=>`${s.label} – ${fmt(s.price)}`;
/* Ảnh sản phẩm: dùng ảnh thật nếu có, nếu không dùng biểu tượng tạm */
const pic=p=>p.img?`<img src="${p.img}" alt="${p.name}" loading="lazy">`:`${p.emoji}<small>Ảnh minh họa tạm</small>`;
/* Giá hiển thị trên thẻ: một mức giá hoặc khoảng giá giữa các quy cách */
function priceText(p){
  const v=p.sizes.map(s=>s.price);
  if(v.includes(null))return fmt(null);
  const lo=Math.min(...v),hi=Math.max(...v);
  return lo===hi?fmt(lo):`${fmt(lo)} – ${fmt(hi)}`;
}
let cart=JSON.parse(localStorage.getItem('lanori_cart_v2')||'[]');
let wish=JSON.parse(localStorage.getItem('lanori_wish')||'[]');
let cat='all',query='';
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2200)}
const save=()=>localStorage.setItem('lanori_cart_v2',JSON.stringify(cart));

/* ===== HIỂN THỊ SẢN PHẨM + LỌC + TÌM KIẾM ===== */
function renderFilters(){
  $('#filters').innerHTML=Object.entries(CATS).map(([k,v])=>`<button data-c="${k}" class="${k===cat?'on':''}">${v}</button>`).join('');
}
function renderProducts(){
  const list=PRODUCTS.filter(p=>(cat==='all'||p.cat===cat)&&(p.name+p.flavor+p.desc).toLowerCase().includes(query));
  $('#noResult').hidden=list.length>0;
  $('#productGrid').innerHTML=list.map(p=>`
  <article class="pcard reveal in" data-id="${p.id}">
    <div class="ph">${pic(p)}</div>
    <h3>${p.name} <span data-wish="${p.id}">${wish.includes(p.id)?'❤️':'🤍'}</span></h3>
    <p>${p.desc}</p><small class="muted">Hương vị: ${p.flavor}</small>
    <div class="price">${priceText(p)}</div>
    <select class="size" aria-label="Quy cách">${p.sizes.map((s,i)=>`<option value="${i}">${sizeOpt(s)}</option>`).join('')}</select>
    <div class="row"><button data-add="${p.id}">Thêm vào giỏ</button><button class="buy" data-buy="${p.id}">Mua ngay</button></div>
  </article>`).join('');
}

/* ===== GIỎ HÀNG ===== */
function addToCart(id,opt={},qty=1,si=0){
  const p=PRODUCTS.find(x=>x.id===id),s=p.sizes[si];
  opt={size:s.label,...opt};
  const key=id+JSON.stringify(opt);
  const ex=cart.find(i=>i.key===key);
  ex?ex.qty+=qty:cart.push({key,id,name:p.name,price:s.price,opt,qty});
  save();renderCart();toast('Đã thêm vào giỏ hàng');
}
function totals(){
  const sub=cart.some(i=>i.price==null)?null:cart.reduce((s,i)=>s+i.price*i.qty,0);
  const total=sub==null||DELIVERY_FEE==null?null:sub+DELIVERY_FEE;
  return{sub,total};
}
const optText=o=>[o.size,o.flavor,o.sweet,o.add&&o.add.length?'+ '+o.add.join(', '):''].filter(Boolean).join(' · ');
function renderCart(){
  $('#cartCount').textContent=cart.reduce((s,i)=>s+i.qty,0);
  $('#cartItems').innerHTML=cart.length?cart.map(i=>`
  <div class="item"><div><b>${i.name}</b><small>${optText(i.opt)}</small>
    <div class="qty"><button data-dec="${i.key}">−</button>${i.qty}<button data-inc="${i.key}">+</button></div></div>
    <div style="text-align:right">${fmt(i.price==null?null:i.price*i.qty)}<br><button class="rm" data-rm="${i.key}">Xóa</button></div></div>`).join(''):'<p class="muted">Giỏ hàng trống.</p>';
  const t=totals();$('#subtotal').textContent=fmt(t.sub);$('#total').textContent=fmt(t.total);
}
function toggleCart(open){$('#drawer').classList.toggle('open',open);$('#overlay').classList.toggle('on',open)}

/* ===== BẢNG CHỌN SẢN PHẨM =====
   mode: 'view' (xem chi tiết), 'add' (Thêm vào giỏ), 'buy' (Mua ngay).
   Các nút trên thẻ sản phẩm luôn mở bảng này trước khi thêm vào giỏ. */
function openProduct(id,mode='view',si=0){
  const p=PRODUCTS.find(x=>x.id===id);
  const btn=mode==='buy'?'Mua ngay':'Thêm vào giỏ';
  $('#productBody').innerHTML=`<button class="x" data-close aria-label="Đóng">✕</button>
  <div class="mgrid"><div class="ph">${pic(p)}</div>
  <div><h3>${p.name}</h3><p>${p.desc}</p>
    <p><b>Thành phần:</b> ${p.ing}</p><p><b>Lợi ích:</b> ${p.ben}</p><p><b>Hương vị:</b> ${p.flavor}</p>
    ${p.flavors?`<label><b>Chọn hương vị</b><select id="mFlavor">${p.flavors.map(f=>`<option>${f}</option>`).join('')}</select></label>`:''}
    <label>Quy cách<select id="mSize" data-id="${p.id}">${p.sizes.map((s,i)=>`<option value="${i}" ${i===si?'selected':''}>${sizeOpt(s)}</option>`).join('')}</select></label>
    <label>Độ ngọt<select id="mSweet">${SWEET.map((s,i)=>`<option ${i===(p.cat==='plain'?0:2)?'selected':''}>${s}</option>`).join('')}</select></label>
    <div class="adds"><b>Thêm vào:</b>${ADDONS.map(a=>`<label class="ck"><input type="checkbox" value="${a}"> ${a}</label>`).join('')}</div>
    <div class="price" id="mPrice">${fmt(p.sizes[si].price)}</div>
    <label>Số lượng <input type="number" id="mQty" value="1" min="1" style="width:80px"></label>
    <button class="btn btn-primary full" id="mAdd" data-id="${p.id}" data-mode="${mode}">${btn}</button></div></div>`;
  $('#productModal').classList.add('on');
}
/* Đổi quy cách trong bảng chọn thì cập nhật giá */
document.addEventListener('change',e=>{
  if(e.target.id==='mSize'){
    const p=PRODUCTS.find(x=>x.id===+e.target.dataset.id);
    $('#mPrice').textContent=fmt(p.sizes[+e.target.value].price);
  }
});

/* ===== THANH TOÁN ===== */
function openCheckout(){
  if(!cart.length)return toast('Giỏ hàng đang trống');
  const t=totals();toggleCart(false);
  $('#orderSummary').innerHTML=cart.map(i=>`${i.name} (${i.opt.size}) × ${i.qty} — ${fmt(i.price==null?null:i.price*i.qty)}`).join('<br>')
    +`<hr>Tạm tính: ${fmt(t.sub)}<br>Phí giao hàng: ${fmt(DELIVERY_FEE,'[PHÍ GIAO HÀNG]')}<br><b>Tổng cộng: ${fmt(t.total)}</b>`;
  $('#checkoutForm').hidden=false;$('#thanks').hidden=true;$('#checkoutModal').classList.add('on');
}
$('#checkoutForm').addEventListener('submit',e=>{
  e.preventDefault();const f=e.target;
  if(!f.name.value.trim()||!f.address.value.trim())return $('#formErr').textContent='Vui lòng nhập họ tên và địa chỉ.';
  if(!/^(0|\+84)\d{9}$/.test(f.phone.value.replace(/\s/g,'')))return $('#formErr').textContent='Số điện thoại không hợp lệ.';
  if(!/^\S+@\S+\.\S+$/.test(f.email.value))return $('#formErr').textContent='Email không hợp lệ.';
  $('#formErr').textContent='';cart=[];save();renderCart();f.reset();f.hidden=true;$('#thanks').hidden=false;
});

/* ===== SỰ KIỆN CHUNG ===== */
const cardSize=t=>+t.closest('.pcard').querySelector('select.size').value; // quy cách đang chọn trên thẻ
document.addEventListener('click',e=>{
  const t=e.target,d=k=>t.dataset[k];
  if(d('c')){cat=d('c');renderFilters();renderProducts()}
  else if(d('add')){e.stopPropagation();openProduct(+d('add'),'add',cardSize(t))}
  else if(d('buy')){e.stopPropagation();openProduct(+d('buy'),'buy',cardSize(t))}
  else if(d('wish')){e.stopPropagation();const id=+d('wish');wish=wish.includes(id)?wish.filter(x=>x!==id):[...wish,id];localStorage.setItem('lanori_wish',JSON.stringify(wish));renderProducts()}
  else if(d('inc')){cart.find(i=>i.key===d('inc')).qty++;save();renderCart()}
  else if(d('dec')){const i=cart.find(i=>i.key===d('dec'));if(--i.qty<1)cart=cart.filter(x=>x!==i);save();renderCart()}
  else if(d('rm')){cart=cart.filter(i=>i.key!==d('rm'));save();renderCart()}
  else if(t.id==='mAdd'){
    const add=[...document.querySelectorAll('#productBody input[type=checkbox]:checked')].map(c=>c.value);
    const fl=$('#mFlavor');
    addToCart(+d('id'),{flavor:fl&&fl.value,sweet:$('#mSweet').value,add},Math.max(1,+$('#mQty').value||1),+$('#mSize').value);
    $('#productModal').classList.remove('on');
    if(d('mode')==='buy')openCheckout(); // "Mua ngay" thì chuyển sang thanh toán
  }
  else if(t.closest('.pcard')&&!t.closest('button')&&!t.closest('select'))openProduct(+t.closest('.pcard').dataset.id);
  if(t.hasAttribute('data-close')||t.classList.contains('modal'))document.querySelectorAll('.modal').forEach(m=>m.classList.remove('on'));
  if(t.closest('nav a'))$('#nav').classList.remove('open');
});
$('#cartBtn').onclick=()=>toggleCart(true);
$('#closeCart').onclick=$('#overlay').onclick=()=>toggleCart(false);
$('#clearCart').onclick=()=>{cart=[];save();renderCart()};
$('#checkoutBtn').onclick=openCheckout;
$('#burger').onclick=()=>$('#nav').classList.toggle('open');
$('#searchBtn').onclick=()=>{$('#search').classList.toggle('open');$('#search').focus()};
$('#search').oninput=e=>{query=e.target.value.toLowerCase().trim();renderProducts();if(query)location.hash='#products'};
$('#newsletter').onsubmit=e=>{e.preventDefault();toast('Cảm ơn bạn đã đăng ký!');e.target.reset()};

/* Khu vực cá nhân hóa (minh họa) */
$('#sweet').oninput=e=>$('#sweetLabel').textContent=SWEET[e.target.value];
$('#addons').innerHTML=ADDONS.map(a=>`<span>${a}</span>`).join('');
$('#addons').onclick=e=>{if(e.target.tagName==='SPAN')e.target.classList.toggle('on')};

/* Hiệu ứng khi cuộn */
const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('in')),{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

renderFilters();renderProducts();renderCart();
