/* ===== CẤU HÌNH ===== */
const DELIVERY_FEE = 20000;     // phí giao hàng nội thành Hà Nội
const FREE_SHIP_FROM = 150000;  // đơn từ mức này được miễn phí giao hàng
const ADDON_PRICE = 5000;       // phí mỗi topping thêm
const ZALO_PHONE = '0975971860';  // số điện thoại Zalo nhận đơn
const ZALO_URL = 'https://zalo.me/' + ZALO_PHONE;
const COUPONS = {
  LANORI10: {type: 'pct', v: 10, label: 'Giảm 10% tạm tính'},
  FREESHIP: {type: 'ship', label: 'Miễn phí giao hàng'}
};

/* ===== DỮ LIỆU SẢN PHẨM =====
   sweet: cho chọn độ ngọt; addons: cho thêm topping.
   img: ảnh trong thư mục images (nếu thiếu file sẽ tự dùng biểu tượng thay thế). */
const PRODUCTS = [
  {id:1,cat:'plain',emoji:'🥛',img:'images/suachuanguyenban.jpg',name:'Sữa chua Nguyên bản',flavor:'Nguyên bản, không đường',sweet:false,addons:true,
   sizes:[{label:'Hộp nhỏ',price:7000},{label:'Hộp lớn (300g)',price:30000}],
   desc:'Sữa chua nguyên bản, không đường, dành cho người quan tâm đến sức khỏe.',
   ing:'100% sữa tươi',ben:'Sạch, không đường, dễ kết hợp cùng hạt hoặc trái cây.'},
  {id:2,cat:'sweet',emoji:'🍶',img:'images/suachuacoduong.jpg',name:'Sữa chua Có đường',flavor:'Ngọt dịu, mềm mịn',sweet:true,addons:true,
   sizes:[{label:'Hộp nhỏ',price:7000},{label:'Hộp lớn (300g)',price:30000}],
   desc:'Sữa chua có đường, hương vị mềm mịn, phù hợp dùng hằng ngày.',
   ing:'100% sữa tươi, đường',ben:'Hương vị mềm mịn, tiện dùng mỗi ngày.'},
  {id:3,cat:'fruit',emoji:'🍓',img:'images/suachuatraicay.jpg',name:'Sữa chua Trái cây',flavor:'Dâu tây / Bơ / Đào',flavors:['Dâu tây','Bơ','Đào'],sweet:true,addons:true,
   sizes:[{label:'Cốc nhỏ (100g)',price:7000},{label:'Hộp lớn (300g)',price:30000}],
   desc:'Sữa chua kết hợp trái cây đặc sản Đà Lạt.',
   ing:'100% sữa tươi, trái cây đặc sản Đà Lạt; không dùng hương liệu tổng hợp và puree nhân tạo',ben:'Hương vị trái cây tự nhiên, nhiều lựa chọn.'},
  {id:4,cat:'nut',emoji:'🥜',img:'images/suachuahat.jpg',name:'Sữa chua Hạt dinh dưỡng',flavor:'Các loại hạt',sweet:true,addons:true,
   sizes:[{label:'Hộp nhỏ',price:7000},{label:'Hộp lớn (300g)',price:30000}],
   desc:'Sữa chua kết hợp các loại hạt, phát triển cùng Doha Food.',
   ing:'100% sữa tươi, các loại hạt (hợp tác cùng Doha Food)',ben:'Cung cấp chất xơ và chất béo lành mạnh.'},
  {id:5,cat:'freeze',emoji:'❄️',img:'images/suachuasay.jpg',name:'Sữa chua Sấy thăng hoa',flavor:'Snack giòn',sweet:false,addons:false,
   sizes:[{label:'Gói (100g)',price:30000}],
   desc:'Sữa chua sấy thăng hoa dạng snack giòn, tiện lợi, không dính tay.',
   ing:'Sữa chua sấy thăng hoa',ben:'Giữ lại lợi khuẩn, dưỡng chất và hương vị tự nhiên; dễ bảo quản.'}
];
const CATS={all:'Tất cả',plain:'Nguyên bản',sweet:'Có đường',fruit:'Trái cây',nut:'Hạt dinh dưỡng',freeze:'Sấy thăng hoa'};
const SWEET=['Không ngọt','Ít ngọt','Vừa','Ngọt nhiều'];
const ADDONS=['Dâu tây','Bơ','Đào','Hạnh nhân','Hạt điều','Hạt chia'];

/* ===== TIỆN ÍCH ===== */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>n.toLocaleString('vi-VN')+'đ';
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d'); // bỏ dấu để tìm kiếm
const store={
  get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
};
/* Ảnh sản phẩm: dùng ảnh thật; nếu lỗi tải ảnh sẽ tự chuyển sang biểu tượng */
const pic=p=>`<img src="${p.img}" alt="${p.name}" data-emoji="${p.emoji}" width="400" height="400" loading="lazy">`;
function priceText(p){
  const v=p.sizes.map(s=>s.price),lo=Math.min(...v),hi=Math.max(...v);
  return lo===hi?fmt(lo):`${fmt(lo)} – ${fmt(hi)}`;
}
/* Khóa dòng giỏ hàng chỉ gồm ký tự an toàn, dùng được trong thuộc tính HTML */
const mkKey=(id,opt)=>id+'_'+JSON.stringify(opt).replace(/[^A-Za-z0-9]/g,c=>'~'+c.charCodeAt(0).toString(16));
const sizeOpt=s=>`${s.label} – ${fmt(s.price)}`;
const allowedAddons=(p,flavor)=>p.addons?ADDONS.filter(a=>a!==flavor):[];

let cart=store.get('lanori_cart_v3',[]);
let wish=store.get('lanori_wish',[]);
let coupon=store.get('lanori_coupon',null);
let cat='all',query='';
const prefs={sweet:1,add:[]}; // lựa chọn từ khu vực "Được làm riêng cho bạn"
let lastFocus=null,toastTimer;

const save=()=>{store.set('lanori_cart_v3',cart);store.set('lanori_coupon',coupon)};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('on'),2400)}

/* ===== HIỂN THỊ SẢN PHẨM + LỌC + TÌM KIẾM ===== */
function renderFilters(){
  $('#filters').innerHTML=Object.entries(CATS).map(([k,v])=>`<button data-c="${k}" class="${k===cat?'on':''}" aria-pressed="${k===cat}">${v}</button>`).join('');
}
function renderProducts(){
  const list=PRODUCTS.filter(p=>(cat==='all'||p.cat===cat)&&norm(p.name+' '+p.flavor+' '+p.desc).includes(query));
  $('#noResult').hidden=list.length>0;
  $('#productGrid').innerHTML=list.map(p=>`
  <article class="pcard reveal in" data-id="${p.id}" tabindex="0" aria-label="${p.name}">
    <div class="ph">${pic(p)}</div>
    <h3>${p.name} <button class="wish" data-wish="${p.id}" aria-pressed="${wish.includes(p.id)}" aria-label="Yêu thích ${p.name}">${wish.includes(p.id)?'❤️':'🤍'}</button></h3>
    <p>${p.desc}</p><small class="muted">Hương vị: ${p.flavor}</small>
    <div class="price">${priceText(p)}</div>
    <select class="size" aria-label="Quy cách ${p.name}">${p.sizes.map((s,i)=>`<option value="${i}">${sizeOpt(s)}</option>`).join('')}</select>
    <div class="row"><button data-add="${p.id}">Thêm vào giỏ</button><button class="buy" data-buy="${p.id}">Mua ngay</button></div>
  </article>`).join('');
}

/* ===== GIỎ HÀNG ===== */
function addToCart(id,opt={},qty=1,si=0){
  const p=PRODUCTS.find(x=>x.id===id),s=p.sizes[si];
  const add=opt.add||[];
  const o={size:s.label};
  if(opt.flavor)o.flavor=opt.flavor;
  if(opt.sweet)o.sweet=opt.sweet;
  if(add.length)o.add=add;
  const key=mkKey(id,o),ex=cart.find(i=>i.key===key);
  if(ex)ex.qty=Math.min(99,ex.qty+qty);
  else cart.push({key,id,name:p.name,price:s.price+add.length*ADDON_PRICE,opt:o,qty:Math.min(99,qty)});
  save();renderCart();toast('Đã thêm vào giỏ hàng');
}
function totals(){
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const c=COUPONS[coupon];
  const disc=c&&c.type==='pct'?Math.round(sub*c.v/100/1000)*1000:0;
  const free=!cart.length||sub>=FREE_SHIP_FROM||(c&&c.type==='ship');
  const ship=cart.length&&!free?DELIVERY_FEE:0;
  return{sub,disc,ship,free,total:sub-disc+ship};
}
const optText=o=>[o.size,o.flavor,o.sweet,o.add&&o.add.length?'+ '+o.add.join(', '):''].filter(Boolean).join(' · ');
function renderCart(){
  $('#cartCount').textContent=cart.reduce((s,i)=>s+i.qty,0);
  $('#cartItems').innerHTML=cart.length?cart.map(i=>`
  <div class="item"><div><b>${i.name}</b><small>${optText(i.opt)}</small>
    <div class="qty"><button data-dec="${i.key}" aria-label="Giảm số lượng">−</button>${i.qty}<button data-inc="${i.key}" aria-label="Tăng số lượng">+</button></div></div>
    <div style="text-align:right">${fmt(i.price*i.qty)}<br><button class="rm" data-rm="${i.key}">Xóa</button></div></div>`).join(''):'<p class="muted">Giỏ hàng trống. Hãy chọn một hũ sữa chua nhé!</p>';
  const t=totals(),c=COUPONS[coupon],h=$('#shipHint');
  h.hidden=!cart.length;
  if(cart.length){
    h.innerHTML=t.free?'🎉 Đơn hàng của bạn được miễn phí giao hàng'
      :`🚚 Mua thêm <b>${fmt(FREE_SHIP_FROM-t.sub)}</b> để được miễn phí giao hàng<div class="bar"><i style="width:${Math.min(100,t.sub/FREE_SHIP_FROM*100)}%"></i></div>`;
  }
  $('#subtotal').textContent=fmt(t.sub);
  $('#discRow').hidden=!t.disc;$('#discount').textContent='−'+fmt(t.disc);
  const sf=$('#shipFee');sf.textContent=!cart.length?fmt(0):t.free?'Miễn phí':fmt(t.ship);sf.classList.toggle('free',!!cart.length&&t.free);
  $('#total').textContent=fmt(t.total);
  const m=$('#couponMsg');m.className=c?'ok':'';m.textContent=c?`✓ Đã áp dụng ${coupon}: ${c.label}`:'';
  $('#checkoutBtn').disabled=!cart.length;
}
function applyCoupon(){
  const code=$('#couponInput').value.trim().toUpperCase();
  if(!code){coupon=null;save();renderCart();return}
  if(!COUPONS[code]){renderCart();const m=$('#couponMsg');m.className='err';m.textContent='Mã giảm giá không hợp lệ. Thử LANORI10 hoặc FREESHIP.';return}
  coupon=code;save();renderCart();$('#couponInput').value='';
}

/* ===== MỞ / ĐÓNG CỬA SỔ (có quản lý focus) ===== */
function openModal(m){
  lastFocus=document.activeElement;m.classList.add('on');
  const f=m.querySelector('.x,input,select,button');f&&f.focus();
}
function closeModals(){
  const open=$$('.modal.on');if(!open.length)return;
  open.forEach(m=>m.classList.remove('on'));
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
function toggleCart(open){
  const d=$('#drawer'),was=d.classList.contains('open');
  if(open===was)return;
  d.classList.toggle('open',open);$('#overlay').classList.toggle('on',open);
  d.setAttribute('aria-hidden',!open);
  if(open){lastFocus=document.activeElement;setTimeout(()=>$('#closeCart').focus(),50)}
  else if(lastFocus&&lastFocus.focus)lastFocus.focus();
}

/* ===== BẢNG CHỌN SẢN PHẨM =====
   mode: 'view' (xem chi tiết), 'add' (Thêm vào giỏ), 'buy' (Mua ngay). */
function openProduct(id,mode='view',si=0){
  const p=PRODUCTS.find(x=>x.id===id);
  const btn=mode==='buy'?'Mua ngay':'Thêm vào giỏ';
  const adds=allowedAddons(p);
  $('#productBody').innerHTML=`<button class="x" data-close aria-label="Đóng">✕</button>
  <div class="mgrid"><div class="ph">${pic(p)}</div>
  <div><h3 id="pTitle">${p.name}</h3><p>${p.desc}</p>
    <p><b>Thành phần:</b> ${p.ing}</p><p><b>Lợi ích:</b> ${p.ben}</p><p><b>Hương vị:</b> ${p.flavor}</p>
    ${p.flavors?`<label><b>Chọn hương vị</b><select id="mFlavor">${p.flavors.map(f=>`<option>${f}</option>`).join('')}</select></label>`:''}
    <label>Quy cách<select id="mSize" data-id="${p.id}">${p.sizes.map((s,i)=>`<option value="${i}" ${i===si?'selected':''}>${sizeOpt(s)}</option>`).join('')}</select></label>
    ${p.sweet?`<label>Độ ngọt<select id="mSweet">${SWEET.map((s,i)=>`<option ${i===prefs.sweet?'selected':''}>${s}</option>`).join('')}</select></label>`:''}
    ${adds.length?`<div class="adds"><b>Thêm vào</b> <small class="muted">(+${fmt(ADDON_PRICE)} mỗi loại)</small><br>${adds.map(a=>`<label class="ck"><input type="checkbox" value="${a}" ${prefs.add.includes(a)?'checked':''}> ${a}</label>`).join('')}</div>`:''}
    <label>Số lượng <input type="number" id="mQty" value="1" min="1" max="99" inputmode="numeric" style="width:80px"></label>
    <div class="price">Thành tiền: <span id="mPrice"></span></div>
    <button class="btn btn-primary full" id="mAdd" data-id="${p.id}" data-mode="${mode}">${btn}</button></div></div>`;
  mTotal();openModal($('#productModal'));
}
/* Cập nhật giá theo quy cách, topping, số lượng; chặn topping trùng với hương vị đã chọn */
function mTotal(){
  const sz=$('#mSize');if(!sz)return;
  const p=PRODUCTS.find(x=>x.id===+sz.dataset.id),fl=$('#mFlavor');
  $$('#productBody input[type=checkbox]').forEach(c=>{
    const clash=fl&&c.value===fl.value;
    if(clash)c.checked=false;
    c.disabled=!!clash;c.parentElement.style.opacity=clash?.45:1;
  });
  const n=$$('#productBody input[type=checkbox]:checked').length;
  const unit=p.sizes[+sz.value].price+n*ADDON_PRICE;
  const q=Math.max(1,Math.min(99,+$('#mQty').value||1));
  $('#mPrice').textContent=fmt(unit*q);
}
['input','change'].forEach(ev=>document.addEventListener(ev,e=>{if(e.target.closest('#productBody'))mTotal()}));

/* ===== THANH TOÁN ===== */
const PAY={COD:'Thanh toán khi nhận hàng (COD)',BANK:'Chuyển khoản'};
function renderSummary(){
  const t=totals();
  $('#orderSummary').innerHTML=cart.map(i=>`${i.name} (${optText(i.opt)}) × ${i.qty} — ${fmt(i.price*i.qty)}`).join('<br>')
    +`<hr>Tạm tính: ${fmt(t.sub)}`
    +(t.disc?`<br>Giảm giá (${coupon}): −${fmt(t.disc)}`:'')
    +`<br>Phí giao hàng: ${t.free?'Miễn phí':fmt(t.ship)}<br><b>Tổng cộng: ${fmt(t.total)}</b>`;
}
function openCheckout(){
  if(!cart.length)return toast('Giỏ hàng đang trống');
  toggleCart(false);renderSummary();
  $('#formErr').textContent='';$('#payNote').textContent='';
  $('#checkoutView').hidden=false;$('#thanks').hidden=true;
  openModal($('#checkoutModal'));
}

/* ===== ĐẶT HÀNG QUA ZALO ===== */
$('#checkoutForm').elements.pay.addEventListener('change',e=>{
  $('#payNote').textContent=e.target.value==='BANK'?'LANORI sẽ gửi thông tin chuyển khoản qua Zalo sau khi xác nhận đơn.':'';
});

/* Tạo nội dung tin nhắn đơn hàng */
function buildOrderText(code,f){
  const t=totals(),v=n=>f.elements[n].value.trim();
  return [
    `ĐƠN HÀNG LANORI ${code}`,
    '',
    ...cart.map((i,k)=>`${k+1}. ${i.name} (${optText(i.opt)}) x ${i.qty} = ${fmt(i.price*i.qty)}`),
    '',
    `Tạm tính: ${fmt(t.sub)}`,
    t.disc?`Giảm giá (${coupon}): -${fmt(t.disc)}`:null,
    `Phí giao hàng: ${t.free?'Miễn phí':fmt(t.ship)}`,
    `TỔNG CỘNG: ${fmt(t.total)}`,
    `Thanh toán: ${PAY[f.elements.pay.value]}`,
    '',
    `Người nhận: ${v('name')}`,
    `SĐT: ${v('phone')}`,
    v('email')?`Email: ${v('email')}`:null,
    `Địa chỉ: ${v('address')}`,
    v('notes')?`Ghi chú: ${v('notes')}`:null
  ].filter(l=>l!==null).join('\n');
}

/* Sao chép vào clipboard (có phương án dự phòng) */
async function copyText(text){
  try{await navigator.clipboard.writeText(text);return true}
  catch{
    const ta=$('#orderMsg');
    try{ta.focus();ta.select();return document.execCommand('copy')}catch{return false}
  }
}

$('#checkoutForm').addEventListener('submit',e=>{
  e.preventDefault();const f=e.target,v=n=>f.elements[n].value.trim();
  const fail=(n,msg)=>{$$('#checkoutForm [aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid'));f.elements[n].setAttribute('aria-invalid','true');f.elements[n].focus();$('#formErr').textContent=msg};
  if(!cart.length)return fail('name','Giỏ hàng đang trống.');
  if(!v('name'))return fail('name','Vui lòng nhập họ và tên.');
  if(!/^(0|\+84)\d{9}$/.test(v('phone').replace(/[\s.-]/g,'')))return fail('phone','Số điện thoại không hợp lệ (ví dụ: 0912345678).');
  if(v('email')&&!/^\S+@\S+\.\S+$/.test(v('email')))return fail('email','Email không hợp lệ.');
  if(v('address').length<8)return fail('address','Vui lòng nhập địa chỉ giao hàng đầy đủ.');
  $$('#checkoutForm [aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid'));
  $('#formErr').textContent='';

  const code='LN'+Date.now().toString().slice(-7);
  const msg=buildOrderText(code,f);   // phải tạo TRƯỚC khi xóa giỏ hàng và reset form

  $('#thanks').innerHTML=`<h3>Gần xong rồi! 💗</h3>
    <p>Mã đơn hàng: <b>${code}</b></p>
    <p>Bấm <b>Gửi đơn qua Zalo</b>, sau đó <b>dán</b> nội dung đơn vào khung chat và bấm gửi để LANORI nhận đơn của bạn.</p>
    <textarea id="orderMsg" readonly rows="10"></textarea>
    <button type="button" class="btn btn-primary full" id="zaloSend">Gửi đơn qua Zalo</button>
    <button type="button" class="btn btn-ghost full" id="zaloCopy">Sao chép nội dung đơn</button>
    <p class="muted">Đơn chỉ được ghi nhận khi bạn đã gửi tin nhắn trong Zalo.</p>
    <button type="button" class="btn btn-ghost full" data-close>Đóng</button>`;
  $('#orderMsg').value=msg;   // gán bằng .value để tránh chèn mã HTML từ dữ liệu khách nhập

  $('#zaloSend').onclick=()=>{
    window.open(ZALO_URL,'_blank','noopener');   // mở Zalo ngay trong thao tác bấm để không bị chặn popup
    copyText(msg).then(ok=>toast(ok?'Đã sao chép đơn, hãy dán vào Zalo':'Hãy sao chép nội dung đơn rồi dán vào Zalo'));
  };
  $('#zaloCopy').onclick=()=>copyText(msg).then(ok=>toast(ok?'Đã sao chép nội dung đơn':'Không sao chép được, hãy chọn và sao chép thủ công'));

  cart=[];coupon=null;save();renderCart();f.reset();$('#payNote').textContent='';
  $('#checkoutView').hidden=true;$('#thanks').hidden=false;
  const b=$('#zaloSend');b&&b.focus();
});

/* ===== SỰ KIỆN CHUNG ===== */
const cardSize=b=>+b.closest('.pcard').querySelector('select.size').value; // quy cách đang chọn trên thẻ
const needsOptions=p=>!!(p.flavors||p.sweet||p.addons);
document.addEventListener('click',e=>{
  const t=e.target;
  const b=t.closest('[data-c],[data-add],[data-buy],[data-wish],[data-inc],[data-dec],[data-rm],#mAdd');
  if(b){
    const d=b.dataset;
    if(d.c){cat=d.c;renderFilters();renderProducts()}
    else if(d.add||d.buy){
      const id=+(d.add||d.buy),p=PRODUCTS.find(x=>x.id===id),si=cardSize(b);
      if(!needsOptions(p)){ // sản phẩm không có tùy chọn: thêm nhanh, không cần mở bảng chọn
        addToCart(id,{},1,si);if(d.buy)openCheckout();
      }else openProduct(id,d.add?'add':'buy',si);
    }
    else if(d.wish){
      const id=+d.wish;wish=wish.includes(id)?wish.filter(x=>x!==id):[...wish,id];
      store.set('lanori_wish',wish);
      b.textContent=wish.includes(id)?'❤️':'🤍';b.setAttribute('aria-pressed',wish.includes(id));
    }
    else if(d.inc){const i=cart.find(x=>x.key===d.inc);if(i&&i.qty<99){i.qty++;save();renderCart()}}
    else if(d.dec){const i=cart.find(x=>x.key===d.dec);if(i){if(--i.qty<1)cart=cart.filter(x=>x!==i);save();renderCart()}}
    else if(d.rm){cart=cart.filter(i=>i.key!==d.rm);save();renderCart()}
    else if(b.id==='mAdd'){
      const add=$$('#productBody input[type=checkbox]:checked').map(c=>c.value);
      const fl=$('#mFlavor'),sw=$('#mSweet');
      const qty=Math.max(1,Math.min(99,+$('#mQty').value||1));
      addToCart(+d.id,{flavor:fl&&fl.value,sweet:sw&&sw.value,add},qty,+$('#mSize').value);
      closeModals();
      if(d.mode==='buy')openCheckout(); // "Mua ngay" thì chuyển sang thanh toán
    }
    return;
  }
  if(t.closest('.pcard')&&!t.closest('button,select'))openProduct(+t.closest('.pcard').dataset.id);
  if(t.closest('[data-close]')||t.classList.contains('modal'))closeModals();
  if(t.closest('nav a')){$('#nav').classList.remove('open');$('#burger').setAttribute('aria-expanded','false')}
});
document.addEventListener('keydown',e=>{
  const t=e.target;
  if(e.key==='Escape'){
    closeModals();toggleCart(false);
    $('#nav').classList.remove('open');$('#burger').setAttribute('aria-expanded','false');
    $('#search').classList.remove('open');
  }
  if((e.key==='Enter'||e.key===' ')&&t.matches('[role=button]')){e.preventDefault();t.click()}
  if(e.key==='Enter'&&t.classList&&t.classList.contains('pcard'))openProduct(+t.dataset.id);
  if(e.key==='Tab'){ // giữ focus bên trong cửa sổ đang mở
    const box=$('.modal.on .mbox')||$('#drawer.open');if(!box)return;
    const f=[...box.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea')].filter(x=>x.getClientRects().length);
    if(!f.length)return;
    const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});
$('#cartBtn').onclick=()=>toggleCart(true);
$('#closeCart').onclick=$('#overlay').onclick=()=>toggleCart(false);
$('#clearCart').onclick=()=>{cart=[];save();renderCart()};
$('#checkoutBtn').onclick=openCheckout;
$('#couponBtn').onclick=applyCoupon;
$('#couponInput').addEventListener('keydown',e=>{if(e.key==='Enter')applyCoupon()});
$('#burger').onclick=()=>{const o=$('#nav').classList.toggle('open');$('#burger').setAttribute('aria-expanded',o)};
$('#searchBtn').onclick=()=>{const s=$('#search');s.classList.toggle('open');if(s.classList.contains('open'))s.focus()};
$('#search').oninput=e=>{
  const had=!!query;query=norm(e.target.value.trim());renderProducts();
  if(query&&!had)$('#products').scrollIntoView({behavior:'smooth'}); // chỉ cuộn một lần khi bắt đầu gõ
};
$('#newsletter').onsubmit=e=>{e.preventDefault();toast('Cảm ơn bạn đã đăng ký!');e.target.reset()};
$('#promoForm').onsubmit=e=>{e.preventDefault();toast('Cảm ơn bạn! LANORI sẽ gửi ưu đãi qua email.');e.target.reset()};

/* Khu vực cá nhân hóa: lựa chọn được áp dụng sẵn trong bảng chọn sản phẩm */
$('#sweet').oninput=e=>{prefs.sweet=+e.target.value;$('#sweetLabel').textContent=SWEET[prefs.sweet]};
$('#addons').innerHTML=ADDONS.map(a=>`<span role="button" tabindex="0" aria-pressed="false">${a}</span>`).join('');
$('#addons').onclick=e=>{
  const s=e.target.closest('span');if(!s)return;
  const on=s.classList.toggle('on');s.setAttribute('aria-pressed',on);
  const a=s.textContent;prefs.add=on?[...prefs.add,a]:prefs.add.filter(x=>x!==a);
};

/* Thông tin giao hàng hiển thị theo cấu hình ở đầu file */
$('#shipInfo').textContent=`Giao hàng đến tận nhà cho khách hàng tại Hà Nội. Phí ${fmt(DELIVERY_FEE)}, miễn phí cho đơn từ ${fmt(FREE_SHIP_FROM)}.`;
$('#freeShipDeal').textContent=`Miễn phí giao hàng cho đơn từ ${fmt(FREE_SHIP_FROM)}`;
const zaloLink=$('#zaloLink');if(zaloLink)zaloLink.href=ZALO_URL;   // link Zalo ở mục Liên hệ

/* Ảnh lỗi hoặc thiếu file: thay bằng biểu tượng */
function imgFallback(i){
  const w=i.parentElement;w.classList.add('noimg');
  w.innerHTML=`${i.dataset.emoji||'🥛'}<small>Ảnh đang được cập nhật</small>`;
}
document.addEventListener('error',e=>{if(e.target.tagName==='IMG')imgFallback(e.target)},true);
$$('img').forEach(i=>{if(i.complete&&i.naturalWidth===0&&i.getAttribute('src'))imgFallback(i)});

/* Hiệu ứng khi cuộn, đánh dấu mục menu đang xem, nút lên đầu trang */
const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('in')),{threshold:.15});
$$('.reveal').forEach(el=>io.observe(el));
const links=Object.fromEntries($$('#nav a').map(a=>[a.getAttribute('href').slice(1),a]));
const spy=new IntersectionObserver(es=>es.forEach(x=>{
  if(!x.isIntersecting)return;
  Object.values(links).forEach(a=>a.classList.remove('on'));
  const a=links[x.target.id];a&&a.classList.add('on');
}),{rootMargin:'-40% 0px -55% 0px'});
Object.keys(links).forEach(id=>{const s=document.getElementById(id);s&&spy.observe(s)});
addEventListener('scroll',()=>{$('#toTop').hidden=scrollY<700},{passive:true});
$('#toTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});

renderFilters();renderProducts();renderCart();
/* =====================================================
   ANIMATION BỔ SUNG
   ===================================================== */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Stagger: các thẻ trong cùng nhóm hiện lần lượt */
  document.querySelectorAll('.cards').forEach(g =>
    [...g.children].forEach((c, i) => c.style.setProperty('--d', i * 90 + 'ms')));
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) heroImg.style.setProperty('--d', '200ms');

  /* Sản phẩm render lại (lọc / tìm kiếm) cũng hiện lần lượt */
  const grid = document.getElementById('productGrid');
  if (grid) {
    const stagger = () => [...grid.children].forEach((c, i) =>
      c.style.setProperty('--d', Math.min(i, 12) * 60 + 'ms'));
    new MutationObserver(stagger).observe(grid, { childList: true });
    stagger();
  }

  /* 2. Thanh tiến độ cuộn + đổ bóng header */
  const bar = document.createElement('div');
  bar.id = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
  const header = document.getElementById('header');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      header && header.classList.toggle('scrolled', scrollY > 10);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 3. Hero: trái cây / sữa bay lơ lửng */
  const hero = document.querySelector('.hero');
  if (hero && !reduce) {
    const emojis = ['🥛', '🍓', '🫐', '🍑', '🌿', '🥭'];
    const n = innerWidth < 600 ? 6 : 12;
    const box = document.createElement('div');
    box.className = 'particles';
    box.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.textContent = emojis[i % emojis.length];
      s.style.cssText = `left:${Math.random() * 100}%;font-size:${14 + Math.random() * 20}px;` +
        `animation-duration:${9 + Math.random() * 10}s;animation-delay:${-Math.random() * 15}s`;
      box.appendChild(s);
    }
    hero.prepend(box);

    /* Parallax nhẹ theo chuột (chỉ máy có chuột) */
    if (matchMedia('(hover:hover)').matches && heroImg) {
      hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        heroImg.style.setProperty('--px', x * 18 + 'px');
        heroImg.style.setProperty('--py', y * 18 + 'px');
      });
      hero.addEventListener('mouseleave', () => {
        heroImg.style.setProperty('--px', '0px');
        heroImg.style.setProperty('--py', '0px');
      });
    }
  }

  /* 4. Ripple khi bấm nút + ghi nhớ nút vừa bấm (để bay vào giỏ) */
  let lastPress = null;
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn,.pcard .row button,.filters button');
    lastPress = { el: e.target, t: Date.now(), rect: e.target.getBoundingClientRect() };
    if (!b || b.disabled) return;
    const r = b.getBoundingClientRect();
    const s = Math.max(r.width, r.height) * 2;
    const el = document.createElement('span');
    el.className = 'ripple';
    el.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
    setTimeout(() => el.remove(), 800);
  });

  /* 5. Thêm vào giỏ: số lượng nảy lên + sản phẩm bay vào giỏ */
  const cc = document.getElementById('cartCount');
  const cartBtn = document.getElementById('cartBtn');
  const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  function fly(rect) {
    if (reduce || !rect || !rect.width) return;
    const c = cartBtn.getBoundingClientRect();
    const sx = rect.left + rect.width / 2 - 16, sy = rect.top + rect.height / 2 - 16;
    const ex = c.left + c.width / 2 - 16, ey = c.top + c.height / 2 - 16;
    const d = document.createElement('div');
    d.className = 'fly';
    d.textContent = '🥛';
    document.body.appendChild(d);
    d.animate([
      { transform: `translate(${sx}px,${sy}px) scale(1)`, opacity: 1 },
      { transform: `translate(${(sx + ex) / 2}px,${Math.min(sy, ey) - 90}px) scale(.9)`, opacity: 1, offset: .5 },
      { transform: `translate(${ex}px,${ey}px) scale(.3)`, opacity: .5 }
    ], { duration: 750, easing: 'ease-in-out' }).onfinish = () => d.remove();
  }

  if (cc && cartBtn) {
    let prev = parseInt(cc.textContent, 10) || 0;
    new MutationObserver(() => {
      const n = parseInt(cc.textContent, 10) || 0;
      if (n > prev) {
        replay(cc, 'bump');
        replay(cartBtn, 'shake');
        /* chỉ bay khi vừa bấm từ thẻ sản phẩm / bảng chọn sản phẩm */
        if (lastPress && Date.now() - lastPress.t < 2000 &&
            lastPress.el.closest('.pcard,#productModal')) fly(lastPress.rect);
      }
      prev = n;
    }).observe(cc, { childList: true, characterData: true, subtree: true });
  }
})();
/* =====================================================
   TỐI ƯU ĐIỆN THOẠI – ĐỢT 2
   ===================================================== */
(() => {
  const cc = document.getElementById('cartCount');
  const cartBtn = document.getElementById('cartBtn');
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');

  /* 1. Thanh giỏ hàng dính đáy (CSS chỉ hiện trên điện thoại) */
  if (cc && cartBtn) {
    const bar = document.createElement('button');
    bar.id = 'cartBar';
    bar.type = 'button';
    bar.hidden = true;
    bar.setAttribute('aria-label', 'Xem giỏ hàng');
    bar.innerHTML = '<span class="cb-l">🛒 <b id="cbQty"></b></span>' +
                    '<span class="cb-r"><b id="cbTotal"></b><em>Xem giỏ</em></span>';
    document.body.appendChild(bar);
    bar.addEventListener('click', () => cartBtn.click());

    const qtyEl = bar.querySelector('#cbQty');
    const totEl = bar.querySelector('#cbTotal');
    const sub = document.getElementById('subtotal');
    let prev = parseInt(cc.textContent, 10) || 0;

    const sync = () => {
      const n = parseInt(cc.textContent, 10) || 0;
      bar.hidden = n < 1;
      qtyEl.textContent = n + ' sản phẩm';
      totEl.textContent = sub ? sub.textContent : '';
      if (n > prev && navigator.vibrate) navigator.vibrate(12); // rung nhẹ (Android)
      prev = n;
    };
    const mo = new MutationObserver(sync);
    [cc, sub].forEach(el => el && mo.observe(el, { childList: true, characterData: true, subtree: true }));
    sync();
  }

  /* 2. Bấm ra ngoài menu thì đóng menu */
  if (nav && burger) {
    document.addEventListener('click', e => {
      if (nav.classList.contains('open') && !e.target.closest('#nav,#burger')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* 3. Vuốt xuống để đóng bảng chọn sản phẩm / thanh toán (điện thoại) */
  document.querySelectorAll('.modal').forEach(m => {
    const box = m.querySelector('.mbox');
    if (!box) return;
    let y0 = null, dy = 0;

    m.addEventListener('touchstart', e => {
      if (innerWidth > 600 || !box.contains(e.target) || box.scrollTop > 0) return;
      y0 = e.touches[0].clientY;
      dy = 0;
      box.style.transition = 'none';
    }, { passive: true });

    m.addEventListener('touchmove', e => {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      box.style.transform = `translateY(${dy}px)`;
    }, { passive: true });

    m.addEventListener('touchend', () => {
      if (y0 === null) return;
      y0 = null;
      box.style.transition = 'transform .25s';
      const closeBtn = m.querySelector('.x');
      if (dy > 110 && closeBtn) closeBtn.click();
      box.style.transform = '';
      setTimeout(() => { box.style.transition = ''; }, 300);
    });
  });
})();
