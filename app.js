(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const cfg = window.LUNA_CONFIG || {};
  const configured = cfg.SUPABASE_URL?.startsWith("https://") && !cfg.SUPABASE_URL.includes("PASTE_") && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("PASTE_");
  const db = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const money = n => new Intl.NumberFormat("hy-AM").format(Number(n)||0) + " ֏";
  const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const demoProducts = [
    {id:"demo1",name:"Velvet Matte Lipstick",description:"Թավշյա ավարտով շրթներկ՝ ամեն օրվա համար։",price:5900,category:"lips",image_url:"https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=700&q=80",in_stock:true},
    {id:"demo2",name:"Rose Eyeshadow Palette",description:"Նուրբ վարդագույն և բնական երանգներ։",price:8900,category:"eyes",image_url:"https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=700&q=80",in_stock:true},
    {id:"demo3",name:"Daily Glow Serum",description:"Թեթև շիճուկ՝ մաշկի ամենօրյա խնամքի համար։",price:7500,category:"skincare",image_url:"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80",in_stock:true},
    {id:"demo4",name:"Soft Touch Blush",description:"Թարմ, բնական գույն այտերի համար։",price:4900,category:"makeup",image_url:"https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=700&q=80",in_stock:true},
    {id:"demo5",name:"Volume Mascara",description:"Արտահայտիչ թարթիչների համար։",price:4200,category:"eyes",image_url:"https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=700&q=80",in_stock:true},
    {id:"demo6",name:"Hydrating Face Cream",description:"Խոնավեցնող կրեմ՝ փափուկ մաշկի համար։",price:6800,category:"skincare",image_url:"https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=700&q=80",in_stock:true},
    {id:"demo7",name:"Nude Lip Gloss",description:"Փայլուն նյուդ երանգ՝ շուրթերին։",price:3900,category:"lips",image_url:"https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=700&q=80",in_stock:true},
    {id:"demo8",name:"Everyday Foundation",description:"Հավասար երանգի համար թեթև տոնային միջոց։",price:8200,category:"makeup",image_url:"https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=700&q=80",in_stock:true}
  ];
  let products = [...demoProducts], cart = [], activeCategory = "all", adminUser = null;
  const categoryNames = {makeup:"Դիմահարդարում",eyes:"Աչքեր",lips:"Շուրթեր",skincare:"Մաշկի խնամք"};
  const toast = msg => { const el=$("#toast"); el.textContent=msg; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2800); };
  const setMessage = (id,msg,kind="") => {const el=$("#"+id);if(el){el.textContent=msg;el.className="form-message "+kind;}};
  async function loadProducts() {
    if (db) {
      const {data,error}=await db.from("products").select("*").eq("in_stock",true).order("created_at",{ascending:false});
      if(!error && data) products=data;
      else { $("#storeStatus").textContent="Չհաջողվեց բեռնել ապրանքները։ Ստուգիր Supabase կարգավորումները։"; renderProducts(); return; }
      $("#storeStatus").textContent = products.length ? `${products.length} ապրանք՝ քո ընտրության համար` : "Ապրանքները շուտով կհայտնվեն։";
    } else {
      $("#storeStatus").textContent="Դիտման ռեժիմ․ պատվերների և ադմինի գործառույթների համար լրացրու config.js-ը և միացրու Supabase-ը։";
    }
    renderProducts();
  }
  function renderProducts() {
    const q=$("#searchInput").value.trim().toLowerCase();
    const list=products.filter(p=>(activeCategory==="all"||p.category===activeCategory)&&(`${p.name} ${p.description||""}`).toLowerCase().includes(q));
    $("#productGrid").innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-image"><img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" loading="lazy"><span class="product-tag">${escapeHtml(categoryNames[p.category]||"Beauty")}</span></div><div class="product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||"")}</p><div class="product-bottom"><strong>${money(p.price)}</strong><button class="add-button" data-add="${escapeHtml(p.id)}" ${p.in_stock===false?"disabled":""} aria-label="Ավելացնել զամբյուղ">+</button></div></div></article>`).join(""):`<p class="empty-state">Այս որոնմամբ ապրանք չի գտնվել։</p>`;
  }
  function cartQty(){return cart.reduce((n,i)=>n+i.qty,0);}
  function renderCart(){
    $("#cartCount").textContent=cartQty();
    $("#cartItems").innerHTML=cart.length?cart.map(i=>`<article class="cart-item"><img src="${escapeHtml(i.image_url)}" alt=""><div class="cart-item-info"><strong>${escapeHtml(i.name)}</strong><span>${money(i.price)}</span><div class="qty-control"><button data-qty="${escapeHtml(i.id)}" data-delta="-1">−</button><span>${i.qty}</span><button data-qty="${escapeHtml(i.id)}" data-delta="1">+</button><button class="remove-item" data-remove="${escapeHtml(i.id)}">Հեռացնել</button></div></div></article>`).join(""):`<div class="empty-cart"><span>♡</span><h3>Զամբյուղը դատարկ է</h3><p>Ընտրիր քո սիրելի ապրանքները։</p></div>`;
    $("#cartTotal").textContent=money(cart.reduce((n,i)=>n+i.price*i.qty,0));
    $("#checkoutButton").disabled=!cart.length;
  }
  function addToCart(id){const p=products.find(x=>String(x.id)===String(id));if(!p)return;const existing=cart.find(x=>String(x.id)===String(id));if(existing)existing.qty++;else cart.push({...p,qty:1});renderCart();toast("Ապրանքը ավելացվեց զամբյուղում։");}
  function openModal(id){$("#"+id).classList.add("open");document.body.classList.add("modal-open");}
  function closeModal(id){$("#"+id).classList.remove("open");if(!$(".modal-backdrop.open")&&!$("#cartPanel").classList.contains("open"))document.body.classList.remove("modal-open");}
  $("#productGrid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(b.dataset.add);});
  $("#searchInput").addEventListener("input",renderProducts);
  $("#categoryFilters").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;$$("[data-category]").forEach(x=>x.classList.toggle("active",x===b));renderProducts();});
  $("#cartItems").addEventListener("click",e=>{const q=e.target.closest("[data-qty]"),r=e.target.closest("[data-remove]");if(q){const i=cart.find(x=>String(x.id)===q.dataset.qty);if(i){i.qty+=Number(q.dataset.delta);if(i.qty<1)cart=cart.filter(x=>x!==i);}renderCart();}if(r){cart=cart.filter(x=>String(x.id)!==r.dataset.remove);renderCart();}});
  $("#openCart").addEventListener("click",()=>{$("#cartOverlay").classList.add("show");$("#cartPanel").classList.add("open");});
  function closeCart(){$("#cartOverlay").classList.remove("show");$("#cartPanel").classList.remove("open");if(!$(".modal-backdrop.open"))document.body.classList.remove("modal-open");}
  $("#closeCart").addEventListener("click",closeCart);$("#cartOverlay").addEventListener("click",closeCart);
  $("#checkoutButton").addEventListener("click",()=>{if(!cart.length)return;if(!db){toast("Նախ միացրու Supabase-ը՝ պատվեր պահպանելու համար։");return;}closeCart();setMessage("checkoutMessage","");openModal("checkoutModal");});
  $$(".close-button[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
  $$(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m.id);}));
  $("#checkoutForm").addEventListener("submit",async e=>{
    e.preventDefault();if(!db){setMessage("checkoutMessage","Supabase-ը կարգավորված չէ։","error");return;}
    const f=new FormData(e.currentTarget),payload={customer_name:f.get("customer_name").trim(),phone:f.get("phone").trim(),address:f.get("address").trim(),note:f.get("note").trim(),items:cart.map(i=>({product_id:String(i.id),name:i.name,price:i.price,quantity:i.qty})),total:cart.reduce((n,i)=>n+i.price*i.qty,0),status:"new"};
    const btn=e.currentTarget.querySelector('button[type="submit"]');btn.disabled=true;setMessage("checkoutMessage","Պատվերը պահպանվում է…");
    const {error}=await db.from("orders").insert(payload);
    btn.disabled=false;
    if(error){setMessage("checkoutMessage","Պատվերը չհաջողվեց պահպանել։ Ստուգիր Supabase SQL/RLS կարգավորումները։ "+error.message,"error");return;}
    cart=[];renderCart();e.currentTarget.reset();setMessage("checkoutMessage","Շնորհակալություն։ Պատվերը գրանցվեց։ Մենք կապ կհաստատենք քեզ հետ։","success");toast("Պատվերը հաջողությամբ գրանցվեց։");
    setTimeout(()=>closeModal("checkoutModal"),2400);
  });
  $("#openAdmin").addEventListener("click",()=>{openModal("adminModal");if(adminUser)showDashboard();});
  $("#adminLoginForm").addEventListener("submit",async e=>{
    e.preventDefault();if(!db){setMessage("adminLoginMessage","Նախ կարգավորիր config.js-ը։","error");return;}
    const f=new FormData(e.currentTarget);const {data,error}=await db.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});
    if(error){setMessage("adminLoginMessage","Մուտքը չհաջողվեց․ ստուգիր էլ․ փոստն ու գաղտնաբառը։","error");return;}
    adminUser=data.user;const {data:adminRow,error:adminErr}=await db.from("admin_users").select("user_id").eq("user_id",adminUser.id).maybeSingle();
    if(adminErr||!adminRow){await db.auth.signOut();adminUser=null;setMessage("adminLoginMessage","Այս հաշիվը ադմինիստրատորի իրավունք չունի։","error");return;}
    showDashboard();
  });
  function showDashboard(){ $("#adminLoginView").hidden=true;$("#adminDashboard").hidden=false;$("#adminEmail").textContent=adminUser?.email||"";loadOrders();loadAdminProducts(); }
  function showLogin(){adminUser=null;$("#adminLoginView").hidden=false;$("#adminDashboard").hidden=true;}
  $("#adminLogout").addEventListener("click",async()=>{if(db)await db.auth.signOut();showLogin();toast("Դուրս եկար համակարգից։");});
  $$(".admin-tabs [data-admin-tab]").forEach(b=>b.addEventListener("click",()=>{ $$(".admin-tabs [data-admin-tab]").forEach(x=>x.classList.toggle("active",x===b));const orders=b.dataset.adminTab==="orders";$("#adminOrdersView").hidden=!orders;$("#adminProductsView").hidden=orders;}));
  $("#refreshOrders").addEventListener("click",loadOrders);
  async function loadOrders(){
    if(!db||!adminUser)return;$("#ordersList").innerHTML='<p class="muted">Բեռնվում է…</p>';
    const {data,error}=await db.from("orders").select("*").order("created_at",{ascending:false});
    if(error){$("#ordersList").innerHTML='<p class="form-message error">Չհաջողվեց բեռնել պատվերները։ Ստուգիր RLS քաղաքականությունները։</p>';return;}
    $("#ordersList").innerHTML=data.length?data.map(o=>`<article class="order-card"><div class="order-card-top"><div><strong>Պատվեր #${escapeHtml(String(o.id).slice(0,8))}</strong><small>${new Date(o.created_at).toLocaleString("hy-AM")}</small></div><select data-order-status="${o.id}" aria-label="Պատվերի կարգավիճակ"><option value="new" ${o.status==="new"?"selected":""}>Նոր</option><option value="processing" ${o.status==="processing"?"selected":""}>Մշակվում է</option><option value="completed" ${o.status==="completed"?"selected":""}>Կատարված</option><option value="cancelled" ${o.status==="cancelled"?"selected":""}>Չեղարկված</option></select></div><p><b>${escapeHtml(o.customer_name)}</b> · ${escapeHtml(o.phone)}</p><p>${escapeHtml(o.address)}</p>${o.note?`<p class="muted">Նշում․ ${escapeHtml(o.note)}</p>`:""}<div class="order-lines">${(o.items||[]).map(i=>`<div><span>${escapeHtml(i.name)} × ${Number(i.quantity)||1}</span><span>${money((Number(i.price)||0)*(Number(i.quantity)||1))}</span></div>`).join("")}</div><div class="total-row"><span>Ընդամենը</span><strong>${money(o.total)}</strong></div></article>`).join(""):'<p class="empty-state">Պատվերներ դեռ չկան։</p>';
  }
  $("#ordersList").addEventListener("change",async e=>{const s=e.target.closest("[data-order-status]");if(!s||!db)return;const {error}=await db.from("orders").update({status:s.value}).eq("id",s.dataset.orderStatus);toast(error?"Չհաջողվեց փոխել կարգավիճակը։":"Պատվերի կարգավիճակը թարմացվեց։");});
  $("#newProductButton").addEventListener("click",()=>{resetProductForm();$("#productForm").hidden=false;$("#productForm").scrollIntoView({behavior:"smooth",block:"start"});});
  $("#cancelProductEdit").addEventListener("click",()=>{$("#productForm").hidden=true;resetProductForm();});
  function resetProductForm(){const f=$("#productForm");f.reset();f.elements.id.value="";f.elements.in_stock.checked=true;$("#productFormTitle").textContent="Նոր ապրանք";setMessage("productFormMessage","");}
  async function loadAdminProducts(){if(!db||!adminUser)return;const {data,error}=await db.from("products").select("*").order("created_at",{ascending:false});if(error){$("#productAdminList").innerHTML='<p class="form-message error">Չհաջողվեց բեռնել ապրանքները։</p>';return;}$("#productAdminList").innerHTML=data.length?data.map(p=>`<article class="admin-product"><img src="${escapeHtml(p.image_url)}" alt=""><div><strong>${escapeHtml(p.name)}</strong><small>${money(p.price)} · ${escapeHtml(categoryNames[p.category]||p.category)} · ${p.in_stock?"Առկա է":"Առկա չէ"}</small></div><div class="button-row"><button class="secondary-button" data-edit-product="${p.id}">Խմբագրել</button><button class="danger-button" data-delete-product="${p.id}">Ջնջել</button></div></article>`).join(""):'<p class="empty-state">Ապրանքներ չկան։ Ավելացրու առաջին ապրանքը։</p>';}
  $("#productAdminList").addEventListener("click",async e=>{
    const edit=e.target.closest("[data-edit-product]"),del=e.target.closest("[data-delete-product]");
    if(edit){const p=products.concat(await fetchAllAdminProducts()).find(x=>String(x.id)===edit.dataset.editProduct);if(!p){toast("Ապրանքը չգտնվեց։");return;}const f=$("#productForm");f.hidden=false;f.elements.id.value=p.id;f.elements.name.value=p.name;f.elements.price.value=p.price;f.elements.category.value=p.category;f.elements.image_url.value=p.image_url;f.elements.description.value=p.description||"";f.elements.in_stock.checked=p.in_stock;$("#productFormTitle").textContent="Խմբագրել ապրանքը";f.scrollIntoView({behavior:"smooth",block:"start"});}
    if(del&&confirm("Վստա՞հ ես, որ ուզում ես ջնջել այս ապրանքը։")){const {error}=await db.from("products").delete().eq("id",del.dataset.deleteProduct);toast(error?"Չհաջողվեց ջնջել ապրանքը։":"Ապրանքը ջնջվեց։");await loadAdminProducts();await loadProducts();}
  });
  async function fetchAllAdminProducts(){if(!db)return[];const {data}=await db.from("products").select("*");return data||[];}
  $("#productForm").addEventListener("submit",async e=>{
    e.preventDefault();if(!db||!adminUser)return;const f=e.currentTarget,fd=new FormData(f);const payload={name:fd.get("name").trim(),price:Number(fd.get("price")),category:fd.get("category"),image_url:fd.get("image_url").trim(),description:fd.get("description").trim(),in_stock:f.elements.in_stock.checked};
    const id=fd.get("id");const result=id?await db.from("products").update(payload).eq("id",id):await db.from("products").insert(payload);
    if(result.error){setMessage("productFormMessage","Չհաջողվեց պահպանել։ "+result.error.message,"error");return;}
    setMessage("productFormMessage","Պահպանվեց։","success");f.hidden=true;resetProductForm();await loadAdminProducts();await loadProducts();toast("Ապրանքների ցանկը թարմացվեց։");
  });
  $("#openSearch").addEventListener("click",()=>{$("#searchInput").focus();$("#shop").scrollIntoView({behavior:"smooth"});});
  $("#year").textContent=new Date().getFullYear();
  if(db){db.auth.getSession().then(({data})=>{if(data.session){adminUser=data.session.user;db.from("admin_users").select("user_id").eq("user_id",adminUser.id).maybeSingle().then(({data:r})=>{if(r)showDashboard();else{db.auth.signOut();adminUser=null;}});}});}
  loadProducts();renderCart();
})();
